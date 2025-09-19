# OCR Service - Receipt Processing

The OCR (Optical Character Recognition) service provides automated text extraction and data parsing from receipt images uploaded to the truck monitoring system.

## Features

- **Dual OCR Providers**: Primary Google Vision API with Tesseract.js fallback
- **Smart Text Parsing**: Extracts merchant, date, total amount, line items, and tax
- **Category Classification**: Automatically categorizes receipts (fuel, toll, parking, maintenance, etc.)
- **Confidence Scoring**: Provides quality assessment of OCR results
- **Batch Processing**: Process multiple receipts simultaneously (admin/manager only)
- **Health Monitoring**: Service health checks and configuration validation

## Architecture

```
Receipt Upload (S3) → OCR Service → Structured Data
                         ↓
    Google Vision API ←→ Text Parser ←→ Tesseract.js
                         ↓
                   Category Classifier
```

## API Endpoints

### Process Receipt
```http
POST /api/ocr/process
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "s3Key": "receipts/2024-01-15/user-123/receipt.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt processed successfully",
  "data": {
    "parsedData": {
      "merchant": "Shell Gas Station",
      "date": "2024-01-15",
      "total": 36.23,
      "subtotal": 34.50,
      "tax": 1.73,
      "category": "fuel",
      "items": [
        {
          "description": "Unleaded Gas",
          "amount": 34.50,
          "quantity": 10.5
        }
      ],
      "confidence": 0.92,
      "ocrProvider": "google-vision",
      "rawText": "Shell Gas Station\\n123 Main St\\n..."
    },
    "processingTime": 1250
  }
}
```

### Health Check
```http
GET /api/ocr/health
Authorization: Bearer <jwt-token>
```

### Get Categories
```http
GET /api/ocr/categories
```

### Batch Processing
```http
POST /api/ocr/batch
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "s3Keys": [
    "receipts/2024-01-15/user-123/receipt1.jpg",
    "receipts/2024-01-15/user-123/receipt2.jpg"
  ]
}
```

### Test Processing (Development Only)
```http
POST /api/ocr/test
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "s3Key": "receipts/2024-01-15/user-123/receipt.jpg",
  "testProvider": "vision" // Optional: "vision", "tesseract", or omit for full pipeline
}
```

## Configuration

### Required Environment Variables

#### Google Cloud Vision API
```bash
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_KEY_FILE=/path/to/service-account-key.json
# Or alternatively:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

#### AWS S3 Configuration
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

#### OCR Settings (Optional)
```bash
OCR_CONFIDENCE_THRESHOLD=0.8
OCR_MAX_RETRIES=2
OCR_TIMEOUT_MS=30000
```

## Setup

### 1. Google Cloud Vision API Setup

1. Create a Google Cloud Project
2. Enable the Vision API
3. Create a service account
4. Download the service account key JSON file
5. Set environment variables

```bash
# Create service account
gcloud iam service-accounts create truck-monitoring-ocr \\
    --description="OCR service for truck monitoring" \\
    --display-name="Truck Monitoring OCR"

# Grant Vision API permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:truck-monitoring-ocr@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/ml.developer"

# Create and download key
gcloud iam service-accounts keys create ./config/gcp-service-account.json \\
    --iam-account=truck-monitoring-ocr@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. Install Dependencies

```bash
npm install @google-cloud/vision tesseract.js
```

### 3. Docker Deployment

```bash
# Build the image
docker build -t truck-monitoring-backend .

# Run with OCR support
docker-compose up -d
```

## Text Parsing Rules

### Date Extraction
- Supports formats: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD
- Month names: Jan 15, 2024 or 15 Jan 2024
- Fallback to current date if none found

### Amount Extraction
- Looks for: "Total:", "Amount:", "TOTAL", etc.
- Supports currency symbols: $, €, £
- Handles comma separators: $1,234.56
- Extracts tax and subtotal when available

### Merchant Extraction
- Uses first non-address line
- Filters out dates, amounts, and common receipt terms
- Prioritizes business names

### Category Classification
Categories are determined by keyword matching:

- **Fuel**: gas, fuel, gasoline, diesel, shell, exxon, bp
- **Toll**: toll, bridge, turnpike, expressway, thruway
- **Parking**: parking, garage, meter, lot
- **Maintenance**: auto, repair, service, oil change, tire
- **Delivery**: delivery, shipping, freight, fedex, ups
- **Miscellaneous**: Default category for unmatched receipts

### Line Items Extraction
- Identifies item lines with descriptions and amounts
- Separates quantities when present
- Excludes tax, subtotal, and total lines

## Error Handling

### OCR Provider Fallback
1. Attempt Google Vision API
2. If Vision API fails, retry with Tesseract
3. If both fail, throw comprehensive error

### Configuration Validation
- Validates all required environment variables
- Checks API credentials before processing
- Returns detailed error messages

### File Access Errors
- Validates S3 key format
- Handles missing files gracefully
- Provides clear error messages

## Performance Considerations

### Processing Times
- Google Vision API: ~1-3 seconds
- Tesseract.js: ~5-15 seconds
- Average processing time: 2-5 seconds

### Optimization Tips
1. Use appropriate image resolution (300-600 DPI)
2. Ensure good image quality and contrast
3. Crop images to focus on receipt text
4. Use supported formats: JPG, PNG, WEBP, PDF

### Batch Processing Limits
- Maximum 10 receipts per batch request
- Admin/Manager role required for batch processing
- Sequential processing to avoid rate limits

## Testing

### Unit Tests
```bash
npm test -- ocrService.test.ts
```

### Integration Tests
```bash
# Test with real APIs (requires valid credentials)
npm run test:integration
```

### Manual Testing
```bash
# Health check
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:3001/api/ocr/health

# Process test receipt
curl -X POST \\
  -H "Authorization: Bearer $JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"s3Key":"receipts/2024-01-15/user-123/test-receipt.jpg"}' \\
  http://localhost:3001/api/ocr/process
```

## Monitoring

### Health Checks
- Service configuration validation
- API connectivity tests
- Database connection status

### Metrics to Monitor
- Processing success rate
- Average processing time
- Error rates by provider
- Confidence score distribution

### Logging
- All OCR processing attempts
- Provider fallback events
- Configuration errors
- Performance metrics

## Security

### Authentication
- JWT token required for all endpoints
- Role-based access control (drivers can only process their own receipts)
- Admin/Manager roles for batch processing and health checks

### Data Privacy
- No receipt data stored in OCR service
- Temporary processing only
- Secure credential management

### Rate Limiting
- Standard rate limits apply
- Additional limits for batch processing
- API key rotation support

## Troubleshooting

### Common Issues

#### Google Vision API Errors
```
Error: Vision API Error: Invalid credentials
```
- Check service account key file path
- Verify API is enabled in GCP console
- Ensure proper IAM permissions

#### Tesseract Processing Slow
```
Tesseract processing taking >30 seconds
```
- Check image quality and size
- Consider preprocessing images
- Adjust timeout settings

#### Low Confidence Scores
```
Confidence score below threshold
```
- Improve image quality
- Check lighting and contrast
- Ensure receipt is properly aligned

#### S3 Access Denied
```
Error: Access denied to S3 object
```
- Verify AWS credentials
- Check S3 bucket permissions
- Validate s3Key format

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

Enable additional logging and test endpoints in development mode.

## Future Enhancements

- [ ] ML model training for custom receipt types
- [ ] Image preprocessing and enhancement
- [ ] Multi-language support
- [ ] Real-time processing with WebSockets
- [ ] Advanced fraud detection
- [ ] Receipt template matching
- [ ] Expense category learning
