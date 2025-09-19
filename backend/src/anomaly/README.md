# Anomaly Detection System

A comprehensive, pluggable anomaly detection system for truck monitoring and expense management.

## Overview

The anomaly detection system provides automated monitoring of receipts and expenses to identify suspicious activities, duplicate submissions, excessive amounts, and other potential issues that require administrator attention.

## Features

### 🔍 **Detection Rules**
- **Excessive Amount**: Detects fuel purchases >3x average amount
- **Duplicate Receipt**: Identifies potential duplicate submissions
- **Outside Trip Dates**: Flags receipts submitted outside assigned trip periods  
- **Suspicious Merchant**: Identifies purchases from blacklisted merchants
- **Frequent Submission**: Detects unusually high submission frequency

### 🔧 **System Capabilities**
- **Pluggable Architecture**: Easy to add new detection rules
- **Configurable Thresholds**: Adjust sensitivity per rule
- **Batch Processing**: Process multiple receipts efficiently
- **Real-time Detection**: Immediate processing of new receipts
- **Severity Levels**: Critical, High, Medium, Low classifications
- **Confidence Scoring**: Machine learning-style confidence ratings
- **Event Integration**: Seamless notification system integration

### 📊 **Monitoring & Reporting**
- **Health Checks**: System status monitoring
- **Performance Statistics**: Rule execution metrics
- **Anomaly Records**: Persistent storage of detected issues
- **Administrative Alerts**: Automated notifications to admins

## Architecture

```
src/anomaly/
├── types.ts                 # Core type definitions
├── detector.ts              # Main anomaly detection engine
├── rules/                   # Individual detection rules
│   └── index.ts            # All rule implementations
├── services/
│   └── anomaly-record.service.ts  # Database operations
├── runner.ts                # Scheduled detection runner
├── test/
│   └── anomaly.test.ts     # Comprehensive test suite
└── demo/
    └── anomaly.demo.ts     # Demo script
```

## Quick Start

### 1. Run the Demo

```bash
# Install dependencies
npm install

# Regenerate Prisma client (if needed)
npx prisma generate

# Run the comprehensive demo
npm run anomaly-demo
```

### 2. Basic Usage

```typescript
import { AnomalyDetector } from './src/anomaly/detector';
import { ExcessiveAmountRule } from './src/anomaly/rules';

// Initialize detector
const detector = new AnomalyDetector({
  enabled: true,
  rules: [],
  minConfidence: 0.7,
  lookbackPeriod: 30
});

// Register rules
detector.registerRule(new ExcessiveAmountRule({
  multiplier: 3.0,
  minSampleSize: 5
}));

// Detect anomalies
const context = buildAnomalyContext(receipt, driver, vehicle, trip);
const result = await detector.detectAnomalies(context);

if (result.flagged) {
  console.log(`Found ${result.anomalies.length} anomalies`);
  result.anomalies.forEach(anomaly => {
    console.log(`- ${anomaly.type}: ${anomaly.description}`);
  });
}
```

### 3. Scheduled Detection

```typescript
import { AnomalyRunner } from './src/anomaly/runner';

const runner = new AnomalyRunner({
  schedule: {
    enabled: true,
    interval: '0 */6 * * *', // Every 6 hours
    timezone: 'America/New_York'
  },
  processing: {
    batchSize: 100,
    maxConcurrency: 5,
    lookbackDays: 7
  }
});

// Start scheduled detection
await runner.start();
```

## Detection Rules

### Excessive Amount Rule
Detects fuel purchases significantly higher than historical average.

**Configuration:**
```typescript
{
  multiplier: 3.0,           // Must be 3x average
  minSampleSize: 5,          // Need 5+ historical receipts
  fuelCategories: ['fuel', 'gas', 'diesel']
}
```

**Example:** Driver's average fuel: $50, Receipt: $180 → **FLAGGED** (3.6x average)

### Duplicate Receipt Rule
Identifies potential duplicate submissions within time window.

**Configuration:**
```typescript
{
  timeWindowHours: 24,       // Check last 24 hours
  exactAmountMatch: true,    // Exact amount required
  amountTolerance: 0.01      // $0.01 tolerance
}
```

**Example:** Two receipts: Same merchant, same amount, same day → **FLAGGED**

### Outside Trip Dates Rule
Flags receipts submitted outside assigned trip periods.

**Configuration:**
```typescript
{
  bufferDays: 1,            // Allow 1 day buffer
  strictMode: false         // Flexible enforcement
}
```

**Example:** Trip: Jan 1-5, Receipt: Jan 10 → **FLAGGED** (outside trip + buffer)

### Suspicious Merchant Rule
Identifies purchases from blacklisted merchant categories.

**Configuration:**
```typescript
{
  blacklistedMerchants: ['casino', 'liquor', 'tobacco'],
  suspiciousCategories: ['entertainment', 'gambling'],
  allowPersonalExpenses: false
}
```

**Example:** Receipt from "Casino Restaurant" → **FLAGGED** (blacklisted merchant)

### Frequent Submission Rule
Detects unusually high submission frequency patterns.

**Configuration:**
```typescript
{
  maxReceiptsPerDay: 10,     // Max 10 per day
  maxReceiptsPerHour: 5,     // Max 5 per hour
  timeWindowDays: 7          // Check last 7 days
}
```

**Example:** 6 receipts in 1 hour → **FLAGGED** (exceeds hourly limit)

## Integration

### Event System Integration

```typescript
import { truckEventEmitter } from '../events/truck.events';

// Listen for anomaly events
truckEventEmitter.onAnomalyDetected({
  handle: async (event) => {
    console.log(`Anomaly detected: ${event.type}`);
    
    // Send admin notification
    await notificationService.sendAdminAlert({
      type: 'anomaly_detected',
      severity: event.severity,
      details: event.details
    });
  }
});
```

### Database Integration

```typescript
import { AnomalyRecordService } from './services/anomaly-record.service';

const service = new AnomalyRecordService();

// Store anomaly record
await service.create({
  type: 'EXCESSIVE_AMOUNT',
  severity: 'HIGH',
  receiptId: 'receipt-123',
  details: { confidence: 0.95, amount: 350 }
});

// Query anomalies
const recentAnomalies = await service.findMany({
  severity: ['HIGH', 'CRITICAL'],
  createdAfter: new Date(Date.now() - 24 * 60 * 60 * 1000)
});
```

## Configuration

### Detector Configuration

```typescript
interface AnomalyDetectorConfig {
  enabled: boolean;                    // Enable/disable detection
  rules: AnomalyRule[];               // Registered rules
  alertThresholds: {                  // Notification thresholds
    [severity]: {
      immediate: boolean;             // Send immediate alerts
      batchSize: number;             // Batch size for grouping
      batchInterval: number;         // Batch interval (minutes)
    }
  };
  lookbackPeriod: number;            // Days of historical data
  minConfidence: number;             // Minimum confidence threshold
}
```

### Rule Configuration

Each rule accepts its own configuration object with rule-specific parameters. See individual rule implementations for detailed configuration options.

## Testing

### Run Test Suite

```bash
# Run all anomaly detection tests
npm run test:anomaly

# Run with coverage
npm run test:anomaly -- --coverage
```

### Test Categories

1. **Unit Tests**: Individual rule testing
2. **Integration Tests**: Full detector workflow
3. **Performance Tests**: Batch processing efficiency
4. **Edge Cases**: Boundary conditions and error handling

### Sample Test Output

```
🧪 Running Anomaly Detection Tests

📋 Test 1: Normal Receipt (should pass)
   Result: 0 anomalies found
   Flagged: false
   ✅ PASS: Normal receipt correctly identified as clean

📋 Test 2: Excessive Amount Detection
   Receipt Amount: $350
   Average Fuel Amount: $50.23
   Result: 1 anomalies found
   ✅ PASS: Excessive amount correctly detected
   Confidence: 95.2%
   Details: Receipt amount $350.00 is 6.97x the average fuel amount $50.23

📋 Test 3: Duplicate Receipt Detection
   Duplicate Amount: $45.67
   Duplicate Merchant: Shell Gas Station
   Result: 1 anomalies found
   ✅ PASS: Duplicate receipt correctly detected
   Confidence: 88.5%
   Details: Potential duplicate of receipt from Shell Gas Station with same amount $45.67

✅ All anomaly detection tests completed!
```

## Performance

### Benchmarks

- **Single Receipt**: < 50ms processing time
- **Batch (100 receipts)**: < 2s processing time
- **Memory Usage**: < 100MB for typical workloads
- **Database Queries**: Optimized with indexes and batch operations

### Scaling Considerations

- **Horizontal Scaling**: Stateless design supports multiple instances
- **Database Optimization**: Proper indexing on anomaly queries
- **Caching**: LRU cache for frequently accessed driver statistics
- **Rate Limiting**: Configurable processing limits to prevent overload

## Monitoring

### Health Checks

```typescript
const health = detector.healthCheck();
console.log(`Healthy: ${health.healthy}`);
console.log(`Rules: ${health.enabledRules}/${health.rulesRegistered}`);
```

### Statistics

```typescript
const stats = detector.getStatistics();
stats.rules.forEach(rule => {
  console.log(`${rule.name}: ${rule.executionCount} executions`);
});
```

### Logging

The system provides comprehensive logging for:
- Rule execution results
- Performance metrics
- Error conditions
- System health status

## Administration

### Adding New Rules

1. **Create Rule Class**:
```typescript
export class CustomRule extends AnomalyRule {
  async detect(context: AnomalyContext): Promise<AnomalyResult[]> {
    // Implementation
  }
}
```

2. **Register Rule**:
```typescript
detector.registerRule(new CustomRule(config));
```

3. **Test Rule**:
```typescript
const result = await detector.detectAnomalies(testContext);
```

### Configuration Management

- **Environment Variables**: Use `.env` for deployment-specific settings
- **Database Configuration**: Store rule parameters in database for runtime updates  
- **Hot Reloading**: Support for rule configuration updates without restart

## Troubleshooting

### Common Issues

1. **No Anomalies Detected**
   - Check rule configuration thresholds
   - Verify minimum confidence settings
   - Ensure sufficient historical data

2. **Performance Issues**
   - Reduce batch size
   - Optimize database queries
   - Check memory usage

3. **False Positives**
   - Adjust rule sensitivity
   - Increase confidence thresholds
   - Review rule logic

### Debug Mode

```typescript
const detector = new AnomalyDetector({
  debug: true,        // Enable debug logging
  verbose: true       // Detailed execution logs
});
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-rule`
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit pull request

### Development Guidelines

- **Type Safety**: All code must be fully typed
- **Test Coverage**: Minimum 90% test coverage
- **Documentation**: Update README for new features
- **Performance**: Benchmark performance impact

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
- Create GitHub issue
- Contact development team
- Check troubleshooting guide

---

**Built with ❤️ for the Truck Monitoring System**
