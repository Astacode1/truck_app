import { OCRService, ParsedReceiptData } from '../services/ocrService';
import { Buffer } from 'buffer';

// Mock Google Cloud Vision
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    textDetection: jest.fn(),
  })),
}));

// Mock Tesseract
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
  createWorker: jest.fn().mockImplementation(() => ({
    loadLanguage: jest.fn(),
    initialize: jest.fn(),
    recognize: jest.fn(),
    terminate: jest.fn(),
  })),
}));

// Mock AWS S3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetObjectCommand: jest.fn(),
}));

describe('OCRService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
    process.env.GOOGLE_CLOUD_KEY_FILE = 'test-key.json';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_S3_BUCKET = 'test-bucket';
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLOUD_PROJECT_ID;
    delete process.env.GOOGLE_CLOUD_KEY_FILE;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;
    delete process.env.AWS_S3_BUCKET;
  });

  describe('validateConfiguration', () => {
    it('should return valid when all environment variables are set', () => {
      const result = OCRService.validateConfiguration();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when Google Cloud config is missing', () => {
      delete process.env.GOOGLE_CLOUD_PROJECT_ID;
      const result = OCRService.validateConfiguration();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Google Cloud Project ID is required');
    });

    it('should return invalid when AWS config is missing', () => {
      delete process.env.AWS_ACCESS_KEY_ID;
      const result = OCRService.validateConfiguration();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AWS credentials are required');
    });
  });

  describe('parseReceiptText', () => {
    it('should parse a typical gas station receipt', () => {
      const sampleText = `
        Shell Gas Station
        123 Main St
        Date: 2024-01-15
        Time: 14:30
        
        Unleaded Gas    $3.45/gal
        Gallons: 10.5
        Total: $36.23
        
        Payment: Credit Card
        Auth: 123456
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.merchant).toBe('Shell Gas Station');
      expect(result.total).toBe(36.23);
      expect(result.date).toBe('2024-01-15');
      expect(result.category).toBe('fuel');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description).toBe('Unleaded Gas');
      expect(result.items[0].amount).toBe(36.23);
    });

    it('should parse a maintenance receipt', () => {
      const sampleText = `
        Auto Service Center
        456 Repair Blvd
        Invoice #: 12345
        Date: 03/20/2024
        
        Oil Change           $29.99
        Air Filter           $15.50
        Labor                $45.00
        Tax                  $7.23
        
        Total: $97.72
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.merchant).toBe('Auto Service Center');
      expect(result.total).toBe(97.72);
      expect(result.date).toBe('2024-03-20');
      expect(result.category).toBe('maintenance');
      expect(result.items).toHaveLength(4);
    });

    it('should handle receipts with poor OCR quality', () => {
      const sampleText = `
        Sh3ll G4s St4tion
        T0tal: $36.23
        D4t3: 01/15/2024
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.merchant).toBe('Sh3ll G4s St4tion'); // Should preserve even with OCR errors
      expect(result.total).toBe(36.23);
      expect(result.date).toBe('2024-01-15');
      expect(result.confidence).toBeLessThan(0.8); // Should reflect poor quality
    });

    it('should classify toll receipts correctly', () => {
      const sampleText = `
        NY Thruway Authority
        Toll Plaza 15
        Date: 2024-01-15
        Vehicle Class: 5
        Total: $12.50
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.category).toBe('toll');
      expect(result.total).toBe(12.50);
    });

    it('should classify parking receipts correctly', () => {
      const sampleText = `
        City Parking Garage
        Downtown Location
        Entry: 09:00 AM
        Exit: 05:30 PM
        Duration: 8.5 hours
        Rate: $2.00/hour
        Total: $17.00
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.category).toBe('parking');
      expect(result.total).toBe(17.00);
    });

    it('should extract line items correctly', () => {
      const sampleText = `
        Grocery Store
        Item 1               $5.99
        Item 2               $12.50
        Item 3               $3.25
        Subtotal            $21.74
        Tax                  $1.95
        Total               $23.69
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.items).toHaveLength(5);
      expect(result.items[0].description).toBe('Item 1');
      expect(result.items[0].amount).toBe(5.99);
      expect(result.subtotal).toBe(21.74);
      expect(result.tax).toBe(1.95);
      expect(result.total).toBe(23.69);
    });

    it('should handle missing or invalid data gracefully', () => {
      const sampleText = `
        Unknown Receipt
        No clear total found
        Some random text
      `;

      const result = OCRService.parseReceiptText(sampleText);

      expect(result.merchant).toBe('Unknown Receipt');
      expect(result.total).toBe(0);
      expect(result.category).toBe('misc');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('downloadFromS3', () => {
    it('should download file from S3 successfully', async () => {
      const mockS3Response = {
        Body: {
          transformToByteArray: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      };

      const { S3Client } = require('@aws-sdk/client-s3');
      const mockSend = jest.fn().mockResolvedValue(mockS3Response);
      S3Client.mockImplementation(() => ({ send: mockSend }));

      const result = await OCRService.downloadFromS3('test-key.jpg');

      expect(result).toBeInstanceOf(Buffer);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw error when S3 download fails', async () => {
      const { S3Client } = require('@aws-sdk/client-s3');
      const mockSend = jest.fn().mockRejectedValue(new Error('S3 Error'));
      S3Client.mockImplementation(() => ({ send: mockSend }));

      await expect(OCRService.downloadFromS3('invalid-key.jpg')).rejects.toThrow('S3 Error');
    });
  });

  describe('performGoogleVisionOCR', () => {
    it('should extract text using Google Vision API', async () => {
      const mockVisionResponse = [
        {
          textAnnotations: [
            { description: 'Sample receipt text\nTotal: $25.99' },
          ],
        },
      ];

      const { ImageAnnotatorClient } = require('@google-cloud/vision');
      const mockTextDetection = jest.fn().mockResolvedValue(mockVisionResponse);
      ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: mockTextDetection,
      }));

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await OCRService.performGoogleVisionOCR(imageBuffer);

      expect(result).toBe('Sample receipt text\nTotal: $25.99');
      expect(mockTextDetection).toHaveBeenCalledWith({
        image: { content: imageBuffer.toString('base64') },
      });
    });

    it('should throw error when Vision API fails', async () => {
      const { ImageAnnotatorClient } = require('@google-cloud/vision');
      const mockTextDetection = jest.fn().mockRejectedValue(new Error('Vision API Error'));
      ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: mockTextDetection,
      }));

      const imageBuffer = Buffer.from('fake-image-data');
      
      await expect(OCRService.performGoogleVisionOCR(imageBuffer)).rejects.toThrow('Vision API Error');
    });
  });

  describe('performTesseractOCR', () => {
    it('should extract text using Tesseract', async () => {
      const mockTesseractResult = {
        data: {
          text: 'Sample receipt text\nTotal: $25.99',
          confidence: 85,
        },
      };

      const tesseract = require('tesseract.js');
      tesseract.recognize.mockResolvedValue(mockTesseractResult);

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await OCRService.performTesseractOCR(imageBuffer);

      expect(result).toBe('Sample receipt text\nTotal: $25.99');
      expect(tesseract.recognize).toHaveBeenCalledWith(imageBuffer, 'eng');
    });

    it('should throw error when Tesseract fails', async () => {
      const tesseract = require('tesseract.js');
      tesseract.recognize.mockRejectedValue(new Error('Tesseract Error'));

      const imageBuffer = Buffer.from('fake-image-data');
      
      await expect(OCRService.performTesseractOCR(imageBuffer)).rejects.toThrow('Tesseract Error');
    });
  });

  describe('processReceipt', () => {
    beforeEach(() => {
      // Mock S3 download
      const mockS3Response = {
        Body: {
          transformToByteArray: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      };
      const { S3Client } = require('@aws-sdk/client-s3');
      S3Client.mockImplementation(() => ({ 
        send: jest.fn().mockResolvedValue(mockS3Response) 
      }));
    });

    it('should process receipt with Google Vision API successfully', async () => {
      const mockVisionResponse = [
        {
          textAnnotations: [
            { 
              description: `Shell Gas Station
                123 Main St
                Date: 2024-01-15
                Total: $36.23` 
            },
          ],
        },
      ];

      const { ImageAnnotatorClient } = require('@google-cloud/vision');
      ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: jest.fn().mockResolvedValue(mockVisionResponse),
      }));

      const result = await OCRService.processReceipt('receipts/2024-01-15/user-123/receipt.jpg');

      expect(result.merchant).toBe('Shell Gas Station');
      expect(result.total).toBe(36.23);
      expect(result.ocrProvider).toBe('google-vision');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should fallback to Tesseract when Vision API fails', async () => {
      // Mock Vision API failure
      const { ImageAnnotatorClient } = require('@google-cloud/vision');
      ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: jest.fn().mockRejectedValue(new Error('Vision API Error')),
      }));

      // Mock successful Tesseract
      const tesseract = require('tesseract.js');
      tesseract.recognize.mockResolvedValue({
        data: {
          text: `Shell Gas Station
            123 Main St
            Date: 2024-01-15
            Total: $36.23`,
          confidence: 75,
        },
      });

      const result = await OCRService.processReceipt('receipts/2024-01-15/user-123/receipt.jpg');

      expect(result.merchant).toBe('Shell Gas Station');
      expect(result.total).toBe(36.23);
      expect(result.ocrProvider).toBe('tesseract');
    });

    it('should throw error when both OCR providers fail', async () => {
      // Mock both providers failing
      const { ImageAnnotatorClient } = require('@google-cloud/vision');
      ImageAnnotatorClient.mockImplementation(() => ({
        textDetection: jest.fn().mockRejectedValue(new Error('Vision API Error')),
      }));

      const tesseract = require('tesseract.js');
      tesseract.recognize.mockRejectedValue(new Error('Tesseract Error'));

      await expect(OCRService.processReceipt('receipts/2024-01-15/user-123/receipt.jpg'))
        .rejects.toThrow('OCR processing failed with both providers');
    });

    it('should handle configuration validation errors', async () => {
      delete process.env.GOOGLE_CLOUD_PROJECT_ID;
      
      await expect(OCRService.processReceipt('receipts/2024-01-15/user-123/receipt.jpg'))
        .rejects.toThrow('OCR service configuration error');
    });
  });

  describe('Date parsing', () => {
    it('should parse various date formats correctly', () => {
      const testCases = [
        { input: 'Date: 01/15/2024', expected: '2024-01-15' },
        { input: 'Date: 15-01-2024', expected: '2024-01-15' },
        { input: 'Date: 2024-01-15', expected: '2024-01-15' },
        { input: 'Jan 15, 2024', expected: '2024-01-15' },
        { input: '15 Jan 2024', expected: '2024-01-15' },
        { input: 'Invalid date', expected: '' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = OCRService.parseReceiptText(input);
        expect(result.date).toBe(expected);
      });
    });
  });

  describe('Amount parsing', () => {
    it('should parse various amount formats correctly', () => {
      const testCases = [
        { input: 'Total: $36.23', expected: 36.23 },
        { input: 'Total: 36.23', expected: 36.23 },
        { input: 'Total $36.23', expected: 36.23 },
        { input: 'Amount: $1,234.56', expected: 1234.56 },
        { input: 'Total: €25.99', expected: 25.99 },
        { input: 'No amount here', expected: 0 },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = OCRService.parseReceiptText(input);
        expect(result.total).toBe(expected);
      });
    });
  });
});
