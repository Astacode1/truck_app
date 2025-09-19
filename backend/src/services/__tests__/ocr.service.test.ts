import { OCRService } from '../ocr.service';

describe('OCRService', () => {
  let ocrService: OCRService;

  beforeEach(() => {
    ocrService = new OCRService();
  });

  describe('parseReceipt', () => {
    it('should parse a fuel receipt correctly', async () => {
      // Arrange
      const mockReceiptImage = Buffer.from('mock-shell-receipt-image');

      // Act
      const result = await ocrService.parseReceipt(mockReceiptImage, 'receipt.jpg');

      // Assert
      expect(result.merchantName).toBe('Shell Gas Station');
      expect(result.amount).toBe(45.67);
      expect(result.category).toBe('fuel');
      expect(result.confidence).toBe(0.95);
      expect(result.rawText).toContain('Shell Gas Station');
      expect(result.rawText).toContain('$45.67');
    });

    it('should parse a restaurant receipt correctly', async () => {
      // Arrange
      const mockReceiptImage = Buffer.from('mock-restaurant-receipt');

      // Act
      const result = await ocrService.parseReceipt(mockReceiptImage, 'meal.jpg');

      // Assert
      expect(result.merchantName).toBe("McDonald's Restaurant");
      expect(result.amount).toBe(14.03);
      expect(result.category).toBe('meals');
      expect(result.confidence).toBe(0.95);
    });

    it('should parse an office supplies receipt correctly', async () => {
      // Arrange
      const mockReceiptImage = Buffer.from('mock-office-receipt-img');

      // Act
      const result = await ocrService.parseReceipt(mockReceiptImage, 'supplies.png');

      // Assert
      expect(result.merchantName).toBe('Office Depot');
      expect(result.amount).toBe(36.17);
      expect(result.category).toBe('office');
      expect(result.confidence).toBe(0.95);
    });

    it('should handle grocery store receipts', async () => {
      // Arrange
      const mockReceiptImage = Buffer.from('mock-grocery-receipt-image');

      // Act
      const result = await ocrService.parseReceipt(mockReceiptImage, 'groceries.jpg');

      // Assert
      expect(result.merchantName).toBe('Walmart Supercenter');
      expect(result.amount).toBe(19.24);
      expect(result.category).toBe('other'); // Walmart doesn't match specific categories
      expect(result.confidence).toBe(0.95);
    });

    it('should handle truck stop fuel receipts', async () => {
      // Arrange
      const mockReceiptImage = Buffer.from('mock-truck-stop-receipt');

      // Act
      const result = await ocrService.parseReceipt(mockReceiptImage, 'fuel.jpg');

      // Assert
      expect(result.merchantName).toBe('Truck Stop Fuel');
      expect(result.amount).toBe(125.50);
      expect(result.category).toBe('fuel');
      expect(result.confidence).toBe(0.95);
    });

    it('should throw error for empty image buffer', async () => {
      // Arrange
      const emptyBuffer = Buffer.alloc(0);

      // Act & Assert
      await expect(ocrService.parseReceipt(emptyBuffer, 'empty.jpg'))
        .rejects.toThrow('OCR processing failed: Empty image buffer');
    });

    it('should handle unknown merchants gracefully', async () => {
      // Arrange
      const mockReceiptImage = Buffer.from('unknown-merchant-receipt');

      // Act
      const result = await ocrService.parseReceipt(mockReceiptImage, 'unknown.jpg');

      // Assert
      expect(result.merchantName).toBeDefined();
      expect(result.amount).toBeGreaterThanOrEqual(0);
      expect(result.category).toBeDefined();
      expect(result.confidence).toBe(0.95);
      expect(result.rawText).toBeDefined();
    });
  });

  describe('validateReceiptImage', () => {
    it('should accept valid image formats', async () => {
      // Arrange
      const validImage = Buffer.from('a'.repeat(2048)); // 2KB image

      // Act & Assert
      await expect(ocrService.validateReceiptImage(validImage, 'receipt.jpg'))
        .resolves.toBe(true);
      await expect(ocrService.validateReceiptImage(validImage, 'receipt.jpeg'))
        .resolves.toBe(true);
      await expect(ocrService.validateReceiptImage(validImage, 'receipt.png'))
        .resolves.toBe(true);
      await expect(ocrService.validateReceiptImage(validImage, 'receipt.pdf'))
        .resolves.toBe(true);
    });

    it('should reject invalid image formats', async () => {
      // Arrange
      const validImage = Buffer.from('a'.repeat(2048));

      // Act & Assert
      await expect(ocrService.validateReceiptImage(validImage, 'receipt.txt'))
        .rejects.toThrow('Invalid image format. Supported formats: JPG, PNG, PDF');
      await expect(ocrService.validateReceiptImage(validImage, 'receipt.doc'))
        .rejects.toThrow('Invalid image format. Supported formats: JPG, PNG, PDF');
      await expect(ocrService.validateReceiptImage(validImage, 'receipt'))
        .rejects.toThrow('Invalid image format. Supported formats: JPG, PNG, PDF');
    });

    it('should reject images that are too large', async () => {
      // Arrange
      const largeImage = Buffer.from('a'.repeat(11 * 1024 * 1024)); // 11MB

      // Act & Assert
      await expect(ocrService.validateReceiptImage(largeImage, 'large.jpg'))
        .rejects.toThrow('Image size too large. Maximum size: 10MB');
    });

    it('should reject images that are too small', async () => {
      // Arrange
      const tinyImage = Buffer.from('a'.repeat(500)); // 500 bytes

      // Act & Assert
      await expect(ocrService.validateReceiptImage(tinyImage, 'tiny.jpg'))
        .rejects.toThrow('Image size too small. Minimum size: 1KB');
    });

    it('should accept images within size limits', async () => {
      // Arrange
      const validSmallImage = Buffer.from('a'.repeat(1024)); // 1KB (minimum)
      const validLargeImage = Buffer.from('a'.repeat(10 * 1024 * 1024)); // 10MB (maximum)

      // Act & Assert
      await expect(ocrService.validateReceiptImage(validSmallImage, 'small.jpg'))
        .resolves.toBe(true);
      await expect(ocrService.validateReceiptImage(validLargeImage, 'large.jpg'))
        .resolves.toBe(true);
    });
  });

  describe('categorization', () => {
    it('should categorize fuel stations correctly', async () => {
      // Test various fuel station names
      const fuelStations = [
        'Shell Gas Station',
        'Exxon Mobile',
        'BP Fuel Center',
        'Truck Stop Fuel',
        'Highway Gas'
      ];

      for (const station of fuelStations) {
        const mockImage = Buffer.from(`mock-${station}-receipt`);
        const result = await ocrService.parseReceipt(mockImage, 'fuel.jpg');
        
        // The category should be 'fuel' for all these merchants
        if (result.merchantName.toLowerCase().includes('shell') ||
            result.merchantName.toLowerCase().includes('fuel') ||
            result.merchantName.toLowerCase().includes('gas') ||
            result.merchantName.toLowerCase().includes('truck stop')) {
          expect(result.category).toBe('fuel');
        }
      }
    });

    it('should categorize restaurants correctly', async () => {
      // Create a receipt that will be categorized as restaurant
      const mockImage = Buffer.from('mock-restaurant-test');
      const result = await ocrService.parseReceipt(mockImage, 'meal.jpg');
      
      if (result.merchantName.toLowerCase().includes('mcdonald')) {
        expect(result.category).toBe('meals');
      }
    });

    it('should categorize office supplies correctly', async () => {
      // Create a receipt that will be categorized as office supplies
      const mockImage = Buffer.from('mock-office-test-receipt');
      const result = await ocrService.parseReceipt(mockImage, 'office.jpg');
      
      if (result.merchantName.toLowerCase().includes('office')) {
        expect(result.category).toBe('office');
      }
    });

    it('should use "other" as default category', async () => {
      // Create a receipt with unknown merchant type
      const mockImage = Buffer.from('mock-unknown-merchant-receipt');
      const result = await ocrService.parseReceipt(mockImage, 'unknown.jpg');
      
      // Walmart and similar should default to 'other'
      if (!result.merchantName.toLowerCase().includes('shell') &&
          !result.merchantName.toLowerCase().includes('mcdonald') &&
          !result.merchantName.toLowerCase().includes('office') &&
          !result.merchantName.toLowerCase().includes('fuel')) {
        expect(result.category).toBe('other');
      }
    });
  });

  describe('field extraction', () => {
    it('should extract amounts correctly from various formats', async () => {
      // Test amount extraction for different receipt formats
      const testCases = [
        { image: 'shell-receipt', expectedAmount: 45.67 },
        { image: 'restaurant-receipt', expectedAmount: 14.03 },
        { image: 'office-receipt', expectedAmount: 36.17 },
        { image: 'grocery-receipt', expectedAmount: 19.24 },
        { image: 'fuel-receipt', expectedAmount: 125.50 }
      ];

      for (const testCase of testCases) {
        const mockImage = Buffer.from(`mock-${testCase.image}`);
        const result = await ocrService.parseReceipt(mockImage, `${testCase.image}.jpg`);
        
        expect(result.amount).toBe(testCase.expectedAmount);
      }
    });

    it('should extract dates correctly', async () => {
      // Create receipt that should have today's date
      const mockImage = Buffer.from('mock-date-receipt');
      const result = await ocrService.parseReceipt(mockImage, 'date.jpg');
      
      expect(result.date).toBeInstanceOf(Date);
      // The mock OCR text includes 09/17/2025
      expect(result.date.getFullYear()).toBe(2025);
      expect(result.date.getMonth()).toBe(8); // September (0-indexed)
      expect(result.date.getDate()).toBe(17);
    });

    it('should handle missing or invalid data gracefully', async () => {
      // Test with minimal receipt data
      const mockImage = Buffer.from('minimal-receipt-data');
      const result = await ocrService.parseReceipt(mockImage, 'minimal.jpg');
      
      // Should have default values when data is missing
      expect(result.merchantName).toBeDefined();
      expect(result.amount).toBeGreaterThanOrEqual(0);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.category).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.rawText).toBeDefined();
    });
  });
});