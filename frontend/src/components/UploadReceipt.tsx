import React, { useState, useCallback } from 'react';
import axios from 'axios';

interface UploadReceiptProps {
  tripId?: string;
  onSuccess?: (receipt: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  expiresIn: number;
  uploadInstructions: {
    method: string;
    headers: Record<string, string>;
    maxFileSize: string;
    allowedTypes: string[];
  };
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ReceiptMetadata {
  description?: string;
  amount?: number;
  merchant?: string;
  receiptDate?: string;
}

const UploadReceipt: React.FC<UploadReceiptProps> = ({
  tripId,
  onSuccess,
  onError,
  className = '',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ReceiptMetadata>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // File validation constants (should match backend)
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_SIZE = 1024; // 1KB

  // Validate file before upload
  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: JPEG, PNG, WebP, PDF`);
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 10MB`);
    }

    if (file.size < MIN_SIZE) {
      errors.push(`File size ${(file.size / 1024).toFixed(2)}KB is below minimum of 1KB`);
    }

    // Check filename
    if (file.name.length > 255) {
      errors.push('Filename is too long (max 255 characters)');
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(file.name.replace(/\.[^.]+$/, ''))) {
      errors.push('Filename contains invalid characters. Use only letters, numbers, dots, hyphens, and underscores');
    }

    return errors;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationErrors = validateFile(selectedFile);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setFile(null);
      return;
    }

    setErrors([]);
    setFile(selectedFile);
  }, []);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  // Step 1: Get presigned URL from backend
  const getPresignedUrl = async (filename: string, fileSize: number): Promise<PresignedUrlResponse> => {
    try {
      const params = new URLSearchParams({
        filename,
        fileSize: fileSize.toString(),
        ...(tripId && { tripId }),
      });

      const response = await axios.get(`/api/receipts/presign?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get presigned URL');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get presigned URL');
      }
      throw error;
    }
  };

  // Step 2: Upload file to S3 using presigned URL
  const uploadToS3 = async (file: File, presignedUrl: string): Promise<void> => {
    try {
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to upload file to S3');
      }
      throw error;
    }
  };

  // Step 3: Create receipt record in database
  const createReceiptRecord = async (s3Key: string, originalFilename: string, fileSize: number): Promise<any> => {
    try {
      const response = await axios.post('/api/receipts', {
        s3Key,
        tripId,
        uploadedBy: 'current-user-id', // This should come from auth context
        originalFilename,
        fileSize,
        ...metadata,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create receipt record');
      }

      return response.data.data.receipt;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create receipt record');
      }
      throw error;
    }
  };

  // Main upload function
  const handleUpload = async () => {
    if (!file) {
      setErrors(['Please select a file to upload']);
      return;
    }

    setUploading(true);
    setUploadProgress(null);
    setErrors([]);

    try {
      // Step 1: Get presigned URL
      const presignedData = await getPresignedUrl(file.name, file.size);

      // Step 2: Upload to S3
      await uploadToS3(file, presignedData.presignedUrl);

      // Step 3: Create receipt record
      const receipt = await createReceiptRecord(presignedData.s3Key, file.name, file.size);

      // Success
      onSuccess?.(receipt);
      
      // Reset form
      setFile(null);
      setMetadata({});
      setUploadProgress(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors([errorMessage]);
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Handle metadata changes
  const handleMetadataChange = (field: keyof ReceiptMetadata, value: string | number) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={`upload-receipt ${className}`}>
      <div className="upload-section">
        <h3>Upload Receipt</h3>
        
        {/* File Drop Zone */}
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <div className="file-type">{file.type}</div>
            </div>
          ) : (
            <div className="drop-prompt">
              <div className="drop-icon">📁</div>
              <div>Drag and drop a receipt file here, or click to select</div>
              <div className="file-requirements">
                Supported: JPEG, PNG, WebP, PDF • Max 10MB
              </div>
            </div>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <button
            type="button"
            className="select-file-btn"
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={uploading}
          >
            {file ? 'Change File' : 'Select File'}
          </button>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="error-list">
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                ❌ {error}
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            <div className="progress-text">
              {uploadProgress.percentage}% • {(uploadProgress.loaded / 1024 / 1024).toFixed(2)} MB of {(uploadProgress.total / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        )}

        {/* Metadata Form */}
        {file && !uploading && (
          <div className="metadata-form">
            <h4>Receipt Details (Optional)</h4>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                placeholder="Receipt description..."
                value={metadata.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={metadata.amount || ''}
                  onChange={(e) => handleMetadataChange('amount', parseFloat(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="merchant">Merchant</label>
                <input
                  id="merchant"
                  type="text"
                  placeholder="Store/vendor name..."
                  value={metadata.merchant || ''}
                  onChange={(e) => handleMetadataChange('merchant', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="receiptDate">Receipt Date</label>
              <input
                id="receiptDate"
                type="date"
                value={metadata.receiptDate || ''}
                onChange={(e) => handleMetadataChange('receiptDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="upload-actions">
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Receipt'}
          </button>
        </div>
      </div>

      {/* Inline Styles - In production, move to CSS file */}
      <style jsx>{`
        .upload-receipt {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .drop-zone.drag-over {
          border-color: #007bff;
          background-color: #f8f9fa;
        }

        .drop-zone.has-file {
          border-color: #28a745;
          background-color: #f8fff9;
        }

        .file-info {
          padding: 10px;
        }

        .file-name {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .file-size, .file-type {
          color: #666;
          font-size: 14px;
        }

        .drop-prompt {
          color: #666;
        }

        .drop-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .file-requirements {
          font-size: 12px;
          color: #999;
          margin-top: 10px;
        }

        .select-file-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 15px;
        }

        .select-file-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .select-file-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-list {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 20px;
        }

        .error-message {
          color: #721c24;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .upload-progress {
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          margin-top: 5px;
          font-size: 14px;
          color: #666;
        }

        .metadata-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .metadata-form h4 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .upload-actions {
          text-align: center;
        }

        .upload-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          min-width: 150px;
        }

        .upload-btn:hover:not(:disabled) {
          background: #218838;
        }

        .upload-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UploadReceipt;
