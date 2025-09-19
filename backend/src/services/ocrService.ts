import { ImageAnnotatorClient } from '@google-cloud/vision';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createWorker } from 'tesseract.js';
import { AppError } from '../middleware/errorHandler';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Google Vision API client
const visionClient = new ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // Path to service account JSON
});

export interface OCRResult {
  text: string;
  confidence: number;
  provider: 'google-vision' | 'tesseract';
  metadata?: {
    words?: number;
    lines?: number;
    paragraphs?: number;
    blocks?: number;
  };
}

export interface ParsedReceiptData {
  date?: string;
  totalAmount?: number;
  currency?: string;
  merchant?: string;
  lineItems?: Array<{
    description: string;
    amount?: number;
    quantity?: number;
  }>;
  category?: string;
  confidence: {
    overall: number;
    date: number;
    amount: number;
    merchant: number;
    category: number;
  };
  rawText: string;
  ocrProvider: string;
}

export class OCRService {
  private static bucketName = process.env.AWS_S3_BUCKET || 'truck-monitoring-receipts';

  /**
   * Download image from S3
   */
  static async downloadFromS3(s3Key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await s3Client.send(command);
      
      if (!response.Body) {
        throw new AppError('No image data found in S3 object', 404);
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to download image from S3: ${error}`, 500);
    }
  }

  /**
   * Perform OCR using Google Vision API
   */
  static async performGoogleVisionOCR(imageBuffer: Buffer): Promise<OCRResult> {
    try {
      const [result] = await visionClient.textDetection({
        image: { content: imageBuffer },
        imageContext: {
          languageHints: ['en'], // Optimize for English
        },
      });

      const detections = result.textAnnotations || [];
      
      if (detections.length === 0) {
        throw new Error('No text detected by Google Vision API');
      }

      // First annotation contains the full text
      const fullText = detections[0].description || '';
      const confidence = detections[0].boundingPoly?.vertices ? 0.9 : 0.7; // Approximate confidence

      // Calculate metadata
      const lines = fullText.split('\n').filter(line => line.trim().length > 0);
      const words = fullText.split(/\s+/).filter(word => word.trim().length > 0);

      return {
        text: fullText,
        confidence,
        provider: 'google-vision',
        metadata: {
          words: words.length,
          lines: lines.length,
          paragraphs: detections.length - 1, // Exclude full text annotation
          blocks: Math.ceil(lines.length / 5), // Estimate blocks
        },
      };
    } catch (error) {
      throw new Error(`Google Vision API failed: ${error}`);
    }
  }

  /**
   * Perform OCR using Tesseract (fallback)
   */
  static async performTesseractOCR(imageBuffer: Buffer): Promise<OCRResult> {
    let worker;
    
    try {
      worker = await createWorker('eng', 1, {
        logger: m => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Tesseract:', m);
          }
        },
      });

      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?/~ ',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });

      const { data } = await worker.recognize(imageBuffer);
      
      const confidence = data.confidence / 100; // Convert to 0-1 scale
      const text = data.text.trim();

      if (!text) {
        throw new Error('No text detected by Tesseract');
      }

      // Calculate metadata
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const words = text.split(/\s+/).filter(word => word.trim().length > 0);

      return {
        text,
        confidence,
        provider: 'tesseract',
        metadata: {
          words: words.length,
          lines: lines.length,
          paragraphs: data.paragraphs?.length || 0,
          blocks: data.blocks?.length || 0,
        },
      };
    } catch (error) {
      throw new Error(`Tesseract OCR failed: ${error}`);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  /**
   * Perform OCR with Google Vision API and Tesseract fallback
   */
  static async performOCR(s3Key: string): Promise<OCRResult> {
    // Download image from S3
    const imageBuffer = await this.downloadFromS3(s3Key);

    // Validate image size
    if (imageBuffer.length > 10 * 1024 * 1024) { // 10MB limit
      throw new AppError('Image file too large for OCR processing', 400);
    }

    if (imageBuffer.length < 1024) { // 1KB minimum
      throw new AppError('Image file too small for OCR processing', 400);
    }

    // Try Google Vision API first
    try {
      console.log('Attempting OCR with Google Vision API...');
      const visionResult = await this.performGoogleVisionOCR(imageBuffer);
      
      // If confidence is too low, fall back to Tesseract
      if (visionResult.confidence < 0.5) {
        console.log('Google Vision confidence too low, falling back to Tesseract...');
        try {
          const tesseractResult = await this.performTesseractOCR(imageBuffer);
          
          // Return better result based on confidence and text length
          if (tesseractResult.confidence > visionResult.confidence || 
              tesseractResult.text.length > visionResult.text.length * 1.2) {
            return tesseractResult;
          }
        } catch (tesseractError) {
          console.log('Tesseract fallback failed:', tesseractError);
          // Still return Vision result even if Tesseract fails
        }
      }

      return visionResult;
    } catch (visionError) {
      console.log('Google Vision API failed, falling back to Tesseract:', visionError);
      
      // Fall back to Tesseract
      try {
        return await this.performTesseractOCR(imageBuffer);
      } catch (tesseractError) {
        throw new AppError(
          `Both OCR providers failed. Vision: ${visionError}. Tesseract: ${tesseractError}`,
          500
        );
      }
    }
  }

  /**
   * Parse extracted text to find structured data
   */
  static parseReceiptText(text: string): ParsedReceiptData['lineItems'] {
    const lineItems: ParsedReceiptData['lineItems'] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
      // Look for lines with amounts ($ followed by numbers)
      const amountMatch = line.match(/\$?\s*(\d+(?:\.\d{2})?)/);
      
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        
        // Skip if amount is too small (likely not a line item)
        if (amount < 0.01) continue;
        
        // Extract description (text before the amount)
        const description = line.replace(/\$?\s*\d+(?:\.\d{2})?.*$/, '').trim();
        
        if (description.length > 2) { // Minimum description length
          // Look for quantity patterns
          const qtyMatch = line.match(/(\d+)\s*x\s*|qty\s*:?\s*(\d+)/i);
          const quantity = qtyMatch ? parseInt(qtyMatch[1] || qtyMatch[2]) : undefined;

          lineItems.push({
            description,
            amount,
            quantity,
          });
        }
      }
    }

    return lineItems.length > 0 ? lineItems : undefined;
  }

  /**
   * Extract date from text
   */
  static extractDate(text: string): { date?: string; confidence: number } {
    const datePatterns = [
      // MM/DD/YYYY or MM-DD-YYYY
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      // DD/MM/YYYY or DD-MM-YYYY
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      // Month DD, YYYY
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i,
      // DD Month YYYY
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})/i,
      // YYYY-MM-DD (ISO format)
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          let dateString: string;
          
          if (pattern.source.includes('Jan|Feb')) {
            // Handle month name patterns
            const monthMap: { [key: string]: string } = {
              'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
              'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
              'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
            };
            
            if (match[1] && isNaN(parseInt(match[1]))) {
              // Month DD, YYYY format
              const month = monthMap[match[1].toLowerCase().substring(0, 3)];
              dateString = `${match[3]}-${month}-${match[2].padStart(2, '0')}`;
            } else {
              // DD Month YYYY format
              const month = monthMap[match[2].toLowerCase().substring(0, 3)];
              dateString = `${match[3]}-${month}-${match[1].padStart(2, '0')}`;
            }
          } else if (pattern.source.includes('(\\\d{4})')) {
            // YYYY-MM-DD format
            dateString = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY format (assume US format)
            dateString = `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
          }

          // Validate date
          const parsedDate = new Date(dateString);
          if (!isNaN(parsedDate.getTime())) {
            // Check if date is reasonable (within last 5 years and not future)
            const now = new Date();
            const fiveYearsAgo = new Date(now.getFullYear() - 5, 0, 1);
            
            if (parsedDate >= fiveYearsAgo && parsedDate <= now) {
              return { date: dateString, confidence: 0.9 };
            }
          }
        } catch (error) {
          continue; // Try next pattern
        }
      }
    }

    return { confidence: 0 };
  }

  /**
   * Extract total amount from text
   */
  static extractTotalAmount(text: string): { totalAmount?: number; currency?: string; confidence: number } {
    const lines = text.split('\n').map(line => line.trim());
    
    // Look for total indicators
    const totalPatterns = [
      /total[:\s]*\$?\s*(\d+(?:\.\d{2})?)/i,
      /amount[:\s]*\$?\s*(\d+(?:\.\d{2})?)/i,
      /due[:\s]*\$?\s*(\d+(?:\.\d{2})?)/i,
      /balance[:\s]*\$?\s*(\d+(?:\.\d{2})?)/i,
      /^.*\$\s*(\d+(?:\.\d{2})?).*$/,
    ];

    let bestMatch: { amount: number; confidence: number; currency: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (let j = 0; j < totalPatterns.length; j++) {
        const pattern = totalPatterns[j];
        const match = line.match(pattern);
        
        if (match) {
          const amount = parseFloat(match[1]);
          
          // Skip unreasonable amounts
          if (amount < 0.01 || amount > 100000) continue;
          
          // Higher confidence for explicit "total" mentions
          let confidence = j < 4 ? 0.9 : 0.6;
          
          // Boost confidence if at the end of receipt
          if (i > lines.length * 0.7) {
            confidence += 0.1;
          }

          // Detect currency
          const currency = line.includes('$') || text.includes('USD') ? 'USD' : 'USD'; // Default to USD

          if (!bestMatch || confidence > bestMatch.confidence || 
              (confidence === bestMatch.confidence && amount > bestMatch.amount)) {
            bestMatch = { amount, confidence, currency };
          }
        }
      }
    }

    if (bestMatch) {
      return {
        totalAmount: bestMatch.amount,
        currency: bestMatch.currency,
        confidence: bestMatch.confidence,
      };
    }

    return { confidence: 0 };
  }

  /**
   * Extract merchant name from text
   */
  static extractMerchant(text: string): { merchant?: string; confidence: number } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { confidence: 0 };
    }

    // First few lines are most likely to contain merchant name
    const topLines = lines.slice(0, Math.min(5, lines.length));
    
    for (const line of topLines) {
      // Skip lines that look like addresses (contain numbers and common address words)
      if (/^\d+.*\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane)/i.test(line)) {
        continue;
      }
      
      // Skip lines that are just numbers or phone numbers
      if (/^[\d\s\-\(\)\.]+$/.test(line)) {
        continue;
      }
      
      // Skip lines that look like receipt numbers or dates
      if (/^(receipt|order|transaction|ref)[\s\#:]*\d+/i.test(line)) {
        continue;
      }
      
      // Look for business-like names (avoid short words)
      if (line.length >= 3 && line.length <= 50) {
        // Clean up the merchant name
        const cleanMerchant = line
          .replace(/[^\w\s&\-\.]/g, '') // Remove special chars except &, -, .
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanMerchant.length >= 3) {
          // Higher confidence for longer, more descriptive names
          const confidence = Math.min(0.9, 0.4 + (cleanMerchant.length / 50));
          
          return { merchant: cleanMerchant, confidence };
        }
      }
    }

    return { confidence: 0 };
  }

  /**
   * Classify receipt category based on merchant and text content
   */
  static classifyCategory(text: string, merchant?: string): { category: string; confidence: number } {
    const textLower = text.toLowerCase();
    const merchantLower = merchant?.toLowerCase() || '';
    
    // Category keywords with weights
    const categoryKeywords = {
      fuel: {
        keywords: ['gas', 'fuel', 'gasoline', 'diesel', 'shell', 'bp', 'exxon', 'chevron', 'mobil', 'sunoco', 'marathon'],
        weight: 1.0,
      },
      toll: {
        keywords: ['toll', 'bridge', 'turnpike', 'expressway', 'ezpass', 'fastlane', 'toll road'],
        weight: 1.0,
      },
      parking: {
        keywords: ['parking', 'park', 'garage', 'meter', 'lot', 'valet'],
        weight: 0.9,
      },
      maintenance: {
        keywords: ['auto', 'repair', 'service', 'oil change', 'tire', 'brake', 'mechanic', 'parts', 'garage', 'lube'],
        weight: 0.8,
      },
      delivery: {
        keywords: ['delivery', 'shipping', 'fedex', 'ups', 'dhl', 'usps', 'freight', 'cargo'],
        weight: 0.8,
      },
      misc: {
        keywords: [], // Default category
        weight: 0.1,
      },
    };

    let bestCategory = 'misc';
    let bestScore = 0;

    for (const [category, { keywords, weight }] of Object.entries(categoryKeywords)) {
      if (category === 'misc') continue; // Skip misc for now
      
      let score = 0;
      
      for (const keyword of keywords) {
        // Check in merchant name (higher weight)
        if (merchantLower.includes(keyword)) {
          score += weight * 2;
        }
        
        // Check in full text
        if (textLower.includes(keyword)) {
          score += weight;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    // Calculate confidence based on score
    const confidence = Math.min(0.95, bestScore / 3); // Normalize to 0-0.95 range
    
    return { category: bestCategory, confidence };
  }

  /**
   * Parse OCR text and extract structured receipt data
   */
  static parseReceiptData(ocrResult: OCRResult): ParsedReceiptData {
    const text = ocrResult.text;
    
    // Extract individual fields
    const dateResult = this.extractDate(text);
    const amountResult = this.extractTotalAmount(text);
    const merchantResult = this.extractMerchant(text);
    const lineItems = this.parseReceiptText(text);
    const categoryResult = this.classifyCategory(text, merchantResult.merchant);

    // Calculate overall confidence
    const confidences = [
      dateResult.confidence,
      amountResult.confidence,
      merchantResult.confidence,
      categoryResult.confidence,
    ];
    
    const overallConfidence = (
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length +
      ocrResult.confidence
    ) / 2;

    return {
      date: dateResult.date,
      totalAmount: amountResult.totalAmount,
      currency: amountResult.currency,
      merchant: merchantResult.merchant,
      lineItems,
      category: categoryResult.category,
      confidence: {
        overall: Math.round(overallConfidence * 100) / 100,
        date: Math.round(dateResult.confidence * 100) / 100,
        amount: Math.round(amountResult.confidence * 100) / 100,
        merchant: Math.round(merchantResult.confidence * 100) / 100,
        category: Math.round(categoryResult.confidence * 100) / 100,
      },
      rawText: text,
      ocrProvider: ocrResult.provider,
    };
  }

  /**
   * Main processing function
   */
  static async processReceipt(s3Key: string): Promise<ParsedReceiptData> {
    try {
      // Perform OCR
      const ocrResult = await this.performOCR(s3Key);
      
      // Parse the extracted text
      const parsedData = this.parseReceiptData(ocrResult);
      
      return parsedData;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`OCR processing failed: ${error}`, 500);
    }
  }

  /**
   * Validate configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check AWS S3 configuration
    if (!process.env.AWS_ACCESS_KEY_ID) {
      errors.push('AWS_ACCESS_KEY_ID is required for S3 access');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      errors.push('AWS_SECRET_ACCESS_KEY is required for S3 access');
    }
    if (!process.env.AWS_S3_BUCKET) {
      errors.push('AWS_S3_BUCKET is required');
    }

    // Check Google Cloud configuration
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      errors.push('GOOGLE_CLOUD_PROJECT_ID is required for Vision API');
    }
    if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
      errors.push('GOOGLE_CLOUD_KEY_FILE path is required for Vision API');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
