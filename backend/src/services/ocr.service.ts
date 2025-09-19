export interface OCRResult {
  text: string;
  confidence: number;
  fields: {
    merchantName?: string;
    amount?: number;
    date?: Date;
    category?: string;
    address?: string;
  };
}

export interface ParsedReceipt {
  merchantName: string;
  amount: number;
  date: Date;
  category: string;
  confidence: number;
  rawText: string;
}

export class OCRService {
  async parseReceipt(imageBuffer: Buffer, filename: string): Promise<ParsedReceipt> {
    try {
      // Simulate OCR processing
      const ocrResult = await this.performOCR(imageBuffer);
      
      // Parse the OCR text to extract receipt fields
      const parsedFields = this.extractReceiptFields(ocrResult.text);
      
      return {
        merchantName: parsedFields.merchantName || 'Unknown Merchant',
        amount: parsedFields.amount || 0,
        date: parsedFields.date || new Date(),
        category: this.categorizeReceipt(parsedFields.merchantName || ''),
        confidence: ocrResult.confidence,
        rawText: ocrResult.text,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OCR processing failed: ${errorMessage}`);
    }
  }

  private async performOCR(imageBuffer: Buffer): Promise<OCRResult> {
    // In a real implementation, this would call an OCR API like Tesseract, AWS Textract, etc.
    // For testing, we'll simulate OCR results
    
    if (imageBuffer.length === 0) {
      throw new Error('Empty image buffer');
    }

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock OCR result based on buffer content (for testing)
    const mockText = this.generateMockOCRText(imageBuffer);
    
    return {
      text: mockText,
      confidence: 0.95,
      fields: this.extractReceiptFields(mockText),
    };
  }

  private generateMockOCRText(imageBuffer: Buffer): string {
    // Generate different mock OCR text based on buffer characteristics
    const bufferHash = imageBuffer.toString('base64').length % 5;
    
    const mockTexts = [
      `Shell Gas Station
123 Main St, Anytown
Date: 09/17/2025
Fuel - Regular: $45.67
Card Payment
Thank you!`,
      
      `McDonald's Restaurant
456 Oak Ave
09/17/2025 2:30 PM
Big Mac Meal: $12.99
Tax: $1.04
Total: $14.03
Credit Card`,
      
      `Office Depot
Office Supplies
Date: 09/17/2025
Paper - A4: $24.99
Pens (Pack): $8.50
Tax: $2.68
Total: $36.17`,
      
      `Walmart Supercenter
Groceries & Supplies
09/17/2025
Snacks: $15.25
Water: $3.99
Total: $19.24
Visa ****1234`,
      
      `Truck Stop Fuel
Highway 101
Diesel Fuel: $125.50
Date: 09/17/2025
Gallons: 25.1
PPG: $4.99
Credit Payment`
    ];

    return mockTexts[bufferHash];
  }

  private extractReceiptFields(ocrText: string): {
    merchantName?: string;
    amount?: number;
    date?: Date;
    address?: string;
  } {
    const fields: any = {};

    // Extract merchant name (usually first line)
    const lines = ocrText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      fields.merchantName = lines[0].trim();
    }

    // Extract amount - look for patterns like $XX.XX, Total: $XX.XX
    const amountPattern = /(?:total|amount|sum)?\s*\$?(\d+\.?\d*)/gi;
    const amountMatches = ocrText.match(amountPattern);
    if (amountMatches && amountMatches.length > 0) {
      // Take the last amount found (likely the total)
      const lastAmount = amountMatches[amountMatches.length - 1];
      const numberMatch = lastAmount.match(/(\d+\.?\d*)/);
      if (numberMatch) {
        fields.amount = parseFloat(numberMatch[1]);
      }
    }

    // Extract date - look for date patterns
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
    const dateMatch = ocrText.match(datePattern);
    if (dateMatch) {
      fields.date = new Date(dateMatch[0]);
    }

    // Extract address
    const addressPattern = /\d+\s+[\w\s]+(?:st|ave|rd|blvd|street|avenue|road|boulevard)/gi;
    const addressMatch = ocrText.match(addressPattern);
    if (addressMatch) {
      fields.address = addressMatch[0];
    }

    return fields;
  }

  private categorizeReceipt(merchantName: string): string {
    const merchant = merchantName.toLowerCase();
    
    // Fuel stations
    if (merchant.includes('shell') || merchant.includes('exxon') || 
        merchant.includes('bp') || merchant.includes('gas') ||
        merchant.includes('fuel') || merchant.includes('truck stop')) {
      return 'fuel';
    }
    
    // Restaurants
    if (merchant.includes('mcdonald') || merchant.includes('burger') ||
        merchant.includes('restaurant') || merchant.includes('cafe') ||
        merchant.includes('pizza') || merchant.includes('subway')) {
      return 'meals';
    }
    
    // Office supplies
    if (merchant.includes('office') || merchant.includes('depot') ||
        merchant.includes('staples') || merchant.includes('supplies')) {
      return 'office';
    }
    
    // Maintenance
    if (merchant.includes('auto') || merchant.includes('service') ||
        merchant.includes('repair') || merchant.includes('tire') ||
        merchant.includes('oil')) {
      return 'maintenance';
    }
    
    // Hotels
    if (merchant.includes('hotel') || merchant.includes('inn') ||
        merchant.includes('motel') || merchant.includes('lodge')) {
      return 'lodging';
    }
    
    // Default category
    return 'other';
  }

  async validateReceiptImage(imageBuffer: Buffer, filename: string): Promise<boolean> {
    // Validate image format
    if (!this.isValidImageFormat(filename)) {
      throw new Error('Invalid image format. Supported formats: JPG, PNG, PDF');
    }

    // Validate image size
    if (imageBuffer.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Image size too large. Maximum size: 10MB');
    }

    if (imageBuffer.length < 1024) { // 1KB minimum
      throw new Error('Image size too small. Minimum size: 1KB');
    }

    return true;
  }

  private isValidImageFormat(filename: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }
}