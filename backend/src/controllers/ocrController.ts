import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { OCRService, ParsedReceiptData } from '../services/ocrService';

export interface ProcessOCRRequest {
  s3Key: string;
}

export interface ProcessOCRResponse {
  success: boolean;
  message: string;
  data: {
    parsedData: ParsedReceiptData;
    processingTime: number;
  };
}

export class OCRController {
  /**
   * POST /api/ocr/process
   * Process receipt image using OCR and extract structured data
   */
  static processReceipt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    const { s3Key }: ProcessOCRRequest = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Authentication check
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate required fields
    if (!s3Key || typeof s3Key !== 'string') {
      throw new AppError('s3Key is required and must be a string', 400);
    }

    // Validate s3Key format
    if (!s3Key.match(/^receipts\/\d{4}-\d{2}-\d{2}\/(trip-\w+|user-\w+)\/\w+\.(jpg|jpeg|png|webp|pdf)$/i)) {
      throw new AppError('Invalid s3Key format', 400);
    }

    // Check if user has permission to process this receipt
    // Extract user/trip info from s3Key
    const s3KeyParts = s3Key.split('/');
    const ownerPart = s3KeyParts[2]; // "trip-xxx" or "user-xxx"
    
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      // For drivers, check if they own the receipt
      if (ownerPart.startsWith('user-')) {
        const ownerUserId = ownerPart.replace('user-', '');
        if (ownerUserId !== userId) {
          throw new AppError('Access denied. You can only process your own receipts.', 403);
        }
      } else if (ownerPart.startsWith('trip-')) {
        // For trip receipts, we'd need to verify the driver owns the trip
        // This would require a database lookup, but for now we'll allow it
        // In production, add trip ownership verification here
      }
    }

    try {
      // Validate OCR service configuration
      const configValidation = OCRService.validateConfiguration();
      if (!configValidation.isValid) {
        throw new AppError(
          `OCR service configuration error: ${configValidation.errors.join(', ')}`,
          500
        );
      }

      // Process the receipt
      const parsedData = await OCRService.processReceipt(s3Key);
      
      const processingTime = Date.now() - startTime;

      // Log successful processing
      console.log(`OCR processing completed for ${s3Key} in ${processingTime}ms by user ${userId}`);

      const response: ProcessOCRResponse = {
        success: true,
        message: 'Receipt processed successfully',
        data: {
          parsedData,
          processingTime,
        },
      };

      res.json(response);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Log error
      console.error(`OCR processing failed for ${s3Key} after ${processingTime}ms:`, error);

      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(`OCR processing failed: ${error}`, 500);
    }
  });

  /**
   * GET /api/ocr/health
   * Check OCR service health and configuration
   */
  static healthCheck = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userRole = req.user?.role;

    // Only allow admin/manager to check health
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    try {
      const configValidation = OCRService.validateConfiguration();
      
      const healthStatus = {
        status: configValidation.isValid ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        configuration: {
          googleVision: {
            configured: !!(process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_KEY_FILE),
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'configured' : 'missing',
            keyFile: process.env.GOOGLE_CLOUD_KEY_FILE ? 'configured' : 'missing',
          },
          aws: {
            configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
            region: process.env.AWS_REGION || 'us-east-1',
            bucket: process.env.AWS_S3_BUCKET ? 'configured' : 'missing',
          },
          tesseract: {
            available: true, // Tesseract.js is always available if installed
          },
        },
        errors: configValidation.errors,
      };

      res.json({
        success: true,
        message: 'OCR service health check completed',
        data: healthStatus,
      });
    } catch (error) {
      throw new AppError(`Health check failed: ${error}`, 500);
    }
  });

  /**
   * POST /api/ocr/test
   * Test OCR processing with a sample image (development only)
   */
  static testProcessing = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userRole = req.user?.role;

    // Only allow admin/manager to run tests
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Test endpoint not available in production', 403);
    }

    const { s3Key, testProvider } = req.body;

    if (!s3Key) {
      throw new AppError('s3Key is required for testing', 400);
    }

    try {
      const startTime = Date.now();
      
      // Test specific provider if requested
      let result;
      if (testProvider === 'vision') {
        const imageBuffer = await OCRService.downloadFromS3(s3Key);
        result = await OCRService.performGoogleVisionOCR(imageBuffer);
      } else if (testProvider === 'tesseract') {
        const imageBuffer = await OCRService.downloadFromS3(s3Key);
        result = await OCRService.performTesseractOCR(imageBuffer);
      } else {
        // Test full processing pipeline
        result = await OCRService.processReceipt(s3Key);
      }

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        message: 'Test processing completed',
        data: {
          result,
          processingTime,
          provider: testProvider || 'full-pipeline',
        },
      });
    } catch (error) {
      throw new AppError(`Test processing failed: ${error}`, 500);
    }
  });

  /**
   * GET /api/ocr/categories
   * Get list of available receipt categories
   */
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = [
      {
        id: 'fuel',
        name: 'Fuel',
        description: 'Gas stations and fuel purchases',
        keywords: ['gas', 'fuel', 'gasoline', 'diesel'],
      },
      {
        id: 'toll',
        name: 'Toll',
        description: 'Highway tolls and bridge fees',
        keywords: ['toll', 'bridge', 'turnpike', 'expressway'],
      },
      {
        id: 'parking',
        name: 'Parking',
        description: 'Parking fees and garage charges',
        keywords: ['parking', 'garage', 'meter', 'lot'],
      },
      {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Vehicle repairs and maintenance',
        keywords: ['auto', 'repair', 'service', 'oil change'],
      },
      {
        id: 'delivery',
        name: 'Delivery',
        description: 'Shipping and delivery services',
        keywords: ['delivery', 'shipping', 'freight'],
      },
      {
        id: 'misc',
        name: 'Miscellaneous',
        description: 'Other business expenses',
        keywords: [],
      },
    ];

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories },
    });
  });

  /**
   * POST /api/ocr/batch
   * Process multiple receipts in batch (admin/manager only)
   */
  static batchProcess = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userRole = req.user?.role;

    // Only allow admin/manager to run batch processing
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new AppError('Access denied. Admin or manager role required.', 403);
    }

    const { s3Keys } = req.body;

    if (!Array.isArray(s3Keys) || s3Keys.length === 0) {
      throw new AppError('s3Keys must be a non-empty array', 400);
    }

    if (s3Keys.length > 10) {
      throw new AppError('Maximum 10 receipts allowed per batch', 400);
    }

    const results: Array<{
      s3Key: string;
      success: boolean;
      data?: ParsedReceiptData;
      error?: string;
    }> = [];
    const startTime = Date.now();

    for (const s3Key of s3Keys) {
      try {
        const parsedData = await OCRService.processReceipt(s3Key);
        results.push({
          s3Key,
          success: true,
          data: parsedData,
        });
      } catch (error) {
        results.push({
          s3Key,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: 'Batch processing completed',
      data: {
        results,
        summary: {
          total: s3Keys.length,
          successful: successCount,
          failed: s3Keys.length - successCount,
          totalProcessingTime: totalTime,
          averageProcessingTime: Math.round(totalTime / s3Keys.length),
        },
      },
    });
  });
}
