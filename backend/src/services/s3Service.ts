import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

// S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const s3Client = new S3Client(s3Config);

// File validation constants
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB

export interface PresignedUrlResult {
  presignedUrl: string;
  s3Key: string;
  expiresIn: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  mimeType?: string;
  extension?: string;
}

export class S3Service {
  private static bucketName = process.env.AWS_S3_BUCKET || 'truck-monitoring-receipts';

  /**
   * Validate file based on filename and size
   */
  static validateFile(filename: string, fileSize?: number): FileValidationResult {
    const errors: string[] = [];
    
    // Extract file extension
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    if (!extension) {
      errors.push('File must have an extension');
      return { isValid: false, errors };
    }

    // Find matching MIME type
    let mimeType: string | undefined;
    for (const [mime, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
      if (extensions.includes(extension)) {
        mimeType = mime;
        break;
      }
    }

    if (!mimeType) {
      const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat().join(', ');
      errors.push(`File type not allowed. Allowed types: ${allowedExtensions}`);
    }

    // Validate file size if provided
    if (fileSize !== undefined) {
      if (fileSize > MAX_FILE_SIZE) {
        errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }
      
      if (fileSize < MIN_FILE_SIZE) {
        errors.push(`File size is below minimum limit of ${MIN_FILE_SIZE / 1024}KB`);
      }
    }

    // Validate filename format
    if (filename.length > 255) {
      errors.push('Filename is too long (max 255 characters)');
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(filename.replace(extension, ''))) {
      errors.push('Filename contains invalid characters. Use only letters, numbers, dots, hyphens, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors,
      mimeType,
      extension,
    };
  }

  /**
   * Generate S3 key for receipt file
   */
  static generateS3Key(filename: string, userId: string, tripId?: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const uuid = uuidv4().substring(0, 8);
    const extension = filename.substring(filename.lastIndexOf('.'));
    
    const basePath = tripId 
      ? `receipts/${timestamp}/trip-${tripId}` 
      : `receipts/${timestamp}/user-${userId}`;
    
    return `${basePath}/${uuid}${extension}`;
  }

  /**
   * Generate presigned URL for file upload
   */
  static async generatePresignedUploadUrl(
    filename: string,
    userId: string,
    tripId?: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<PresignedUrlResult> {
    try {
      // Validate filename
      const validation = this.validateFile(filename);
      if (!validation.isValid) {
        throw new AppError(`File validation failed: ${validation.errors.join(', ')}`, 400);
      }

      // Generate S3 key
      const s3Key = this.generateS3Key(filename, userId, tripId);

      // Create command for presigned URL
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        ContentType: validation.mimeType,
        Metadata: {
          'original-filename': filename,
          'uploaded-by': userId,
          ...(tripId && { 'trip-id': tripId }),
          'upload-timestamp': new Date().toISOString(),
        },
        // Security headers
        ServerSideEncryption: 'AES256',
        // Prevent public read access
        ACL: 'private',
      });

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(s3Client, command, { 
        expiresIn,
        // Additional security headers for the presigned URL
        signableHeaders: new Set(['content-type', 'content-length']),
      });

      return {
        presignedUrl,
        s3Key,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to generate presigned URL', 500);
    }
  }

  /**
   * Generate presigned URL for file download
   */
  static async generatePresignedDownloadUrl(
    s3Key: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      throw new AppError('Failed to generate download URL', 500);
    }
  }

  /**
   * Check if S3 is properly configured
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.AWS_ACCESS_KEY_ID) {
      errors.push('AWS_ACCESS_KEY_ID is not configured');
    }

    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      errors.push('AWS_SECRET_ACCESS_KEY is not configured');
    }

    if (!process.env.AWS_S3_BUCKET) {
      errors.push('AWS_S3_BUCKET is not configured');
    }

    if (!process.env.AWS_REGION) {
      errors.push('AWS_REGION is not configured (using default: us-east-1)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract metadata from S3 key
   */
  static parseS3Key(s3Key: string): {
    date?: string;
    tripId?: string;
    userId?: string;
    filename?: string;
  } {
    const parts = s3Key.split('/');
    const result: any = {};

    if (parts[0] === 'receipts' && parts[1]) {
      result.date = parts[1]; // YYYY-MM-DD
    }

    if (parts[2]) {
      if (parts[2].startsWith('trip-')) {
        result.tripId = parts[2].replace('trip-', '');
      } else if (parts[2].startsWith('user-')) {
        result.userId = parts[2].replace('user-', '');
      }
    }

    if (parts[3]) {
      result.filename = parts[3];
    }

    return result;
  }

  /**
   * Validate S3 configuration on startup
   */
  static async testConnection(): Promise<void> {
    const config = this.validateConfiguration();
    if (!config.isValid) {
      throw new AppError(`S3 configuration errors: ${config.errors.join(', ')}`, 500);
    }

    try {
      // Test S3 connection by attempting to list objects (this will fail gracefully if bucket doesn't exist)
      // We don't actually need to list anything, just test the connection
      await s3Client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: 'test-connection-key-that-doesnt-exist',
      })).catch(() => {
        // Expected to fail, we're just testing the connection
      });
    } catch (error) {
      // Only throw if it's a configuration error, not a "key not found" error
      if (error instanceof Error && error.message.includes('credentials')) {
        throw new AppError('S3 connection failed: Invalid credentials', 500);
      }
    }
  }
}

// File validation constants export for use in frontend
export const FILE_VALIDATION = {
  ALLOWED_TYPES: Object.keys(ALLOWED_FILE_TYPES),
  ALLOWED_EXTENSIONS: Object.values(ALLOWED_FILE_TYPES).flat(),
  MAX_SIZE: MAX_FILE_SIZE,
  MIN_SIZE: MIN_FILE_SIZE,
  MAX_SIZE_MB: MAX_FILE_SIZE / 1024 / 1024,
  MIN_SIZE_KB: MIN_FILE_SIZE / 1024,
} as const;
