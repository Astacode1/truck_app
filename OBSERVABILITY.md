# Observability Setup Guide

This guide covers the comprehensive observability stack implemented for the Truck Monitoring System, including error tracking with Sentry, structured logging with Pino, and metrics collection with Prometheus.

## 🔍 **Observability Stack Overview**

### Components
- **Sentry**: Error tracking and performance monitoring
- **Pino**: Structured logging optimized for CloudWatch
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Metrics visualization and dashboards

## 🚀 **Quick Start**

### 1. Install Dependencies

The following packages have been added to your `package.json`:

```bash
npm install @sentry/node @sentry/profiling-node pino pino-http pino-pretty prom-client
```

### 2. Environment Configuration

Add these environment variables to your `.env` file:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-key@o1234567.ingest.sentry.io/1234567

# Logging Configuration
LOG_LEVEL=info
SERVICE_NAME=truck-monitoring-backend
SERVICE_VERSION=1.0.0

# Environment
NODE_ENV=production
```

### 3. Initialize Observability

```typescript
import express from 'express';
import { initializeObservability } from './config/observability';

const app = express();

// Initialize observability stack
const { logger, metrics } = initializeObservability(app);

// Your routes here...

app.listen(3000);
```

## 📊 **Metrics Available**

### Custom Business Metrics

#### Counters
- `truck_monitoring_receipts_processed_total` - Total receipts processed by OCR
- `truck_monitoring_ocr_failures_total` - Total OCR processing failures
- `truck_monitoring_auth_attempts_total` - Authentication attempts
- `truck_monitoring_api_requests_total` - API requests by endpoint
- `truck_monitoring_database_queries_total` - Database queries

#### Histograms (Response Times)
- `truck_monitoring_http_request_duration_seconds` - HTTP request duration
- `truck_monitoring_ocr_processing_duration_seconds` - OCR processing time
- `truck_monitoring_database_query_duration_seconds` - Database query time

#### Gauges (Current State)
- `truck_monitoring_active_trucks` - Number of active trucks
- `truck_monitoring_active_trips` - Number of active trips
- `truck_monitoring_queue_size` - Processing queue sizes

### System Metrics
- Process CPU usage
- Memory usage
- Garbage collection metrics
- Event loop lag

## 📝 **Usage Examples**

### Error Tracking with Sentry

```typescript
import { captureError, captureMessage, addBreadcrumb } from './config/sentry';

// Capture custom errors
try {
  await processReceipt(file);
} catch (error) {
  captureError(error, {
    truckId: '123',
    fileName: file.name,
    operation: 'ocr_processing'
  });
  throw error;
}

// Log important events
captureMessage('OCR processing completed', 'info', {
  truckId: '123',
  confidence: 0.95
});

// Add breadcrumbs for tracking
addBreadcrumb('File uploaded', 'upload', {
  fileName: file.name,
  fileSize: file.size
});
```

### Structured Logging

```typescript
import { getLogger } from './config/logger';

const logger = getLogger();

// Log with context
logger.log('info', 'Receipt processed successfully', {
  correlationId: 'req-123',
  truckId: 'truck-456',
  amount: 45.67
});

// Business events
logger.businessEvent('fuel_receipt_processed', {
  truckId: 'truck-456',
  amount: 45.67,
  vendor: 'Shell Station'
});

// Performance logging
logger.performance('ocr_processing_time', 2500, {
  fileType: 'image/jpeg',
  confidence: 0.95
});

// Audit logging
logger.audit('user_login', 'authentication', {
  userId: 'user-123',
  ip: '192.168.1.1'
});
```

### Prometheus Metrics

```typescript
import { getMetrics } from './config/metrics';

const metrics = getMetrics();

// Track receipt processing
metrics.trackReceiptProcessing('success', 'truck-123', 'driver-456');

// Track OCR failures
metrics.trackOcrFailure('confidence_too_low', 'truck-123', 'image/jpeg');

// Track processing time
metrics.trackOcrProcessingTime('image/jpeg', 'success', 2500);

// Update current state
metrics.updateActiveTrucks(45);
metrics.updateActiveTrips(23);
```

### Decorator for Automatic Tracking

```typescript
import { trackExecutionTime } from './config/metrics';

class ReceiptController {
  @trackExecutionTime('receipt_processing')
  async processReceipt(file: any) {
    // Method execution time is automatically tracked
    return await this.performOcrProcessing(file);
  }
}
```

## 📈 **Monitoring Setup**

### Prometheus Configuration

The system exposes metrics at `/metrics` endpoint. Configure Prometheus to scrape:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'truck-monitoring-backend'
    static_configs:
      - targets: ['backend:3000']
    scrape_interval: 10s
    metrics_path: /metrics
```

### Grafana Dashboard

Import the provided dashboard from `monitoring/grafana/dashboards/truck-monitoring-dashboard.json`.

**Key Panels:**
- System health and uptime
- Request rate and error rate
- Response time percentiles
- OCR processing metrics
- Database performance
- Active resources (trucks/trips)
- Authentication metrics

### CloudWatch Integration

Logs are automatically formatted for CloudWatch Insights. Use these sample queries:

#### Error Analysis
```sql
fields @timestamp, level, msg, error.message, error.stack
| filter level = "error"
| sort @timestamp desc
```

#### Performance Analysis
```sql
fields @timestamp, operation, duration, response.statusCode
| filter metricType = "performance"
| stats avg(duration), max(duration), min(duration) by operation
```

#### OCR Processing
```sql
fields @timestamp, operation, receiptId, duration, error.message
| filter operation like /ocr/
| sort @timestamp desc
```

## 🚨 **Alerting Rules**

### Prometheus Alerts

Critical alerts are configured in `monitoring/rules/alerts.yml`:

- **High Error Rate**: >10% 5xx errors in 5 minutes
- **OCR Failure Rate**: >5% OCR failures in 5 minutes  
- **High Response Time**: 95th percentile >2 seconds
- **Service Down**: Backend unavailable for >1 minute
- **Database Issues**: Query failure rate >1%

### Sentry Alerts

Configure Sentry alerts for:
- New error types
- Error rate spikes
- Performance degradation
- Release deployment issues

## 🔧 **Deployment Configuration**

### Environment Variables

#### Required
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project
LOG_LEVEL=info
SERVICE_NAME=truck-monitoring-backend
SERVICE_VERSION=1.0.0
```

#### Optional
```bash
# Sentry configuration
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
SENTRY_DEBUG=false

# Logging configuration
LOG_FORMAT=json  # or 'pretty' for development
```

### Docker Configuration

The observability stack is integrated into Docker containers:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      SENTRY_DSN: ${SENTRY_DSN}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      SERVICE_NAME: truck-monitoring-backend
      SERVICE_VERSION: ${SERVICE_VERSION:-1.0.0}
```

### AWS ECS Task Definition

```json
{
  "secrets": [
    {
      "name": "SENTRY_DSN",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:truck-monitoring/sentry-dsn"
    }
  ],
  "environment": [
    {
      "name": "LOG_LEVEL",
      "value": "info"
    },
    {
      "name": "SERVICE_NAME", 
      "value": "truck-monitoring-backend"
    }
  ]
}
```

## 📊 **Metrics Endpoint**

Access Prometheus metrics at: `GET /metrics`

Sample output:
```
# HELP truck_monitoring_receipts_processed_total Total number of receipts processed
# TYPE truck_monitoring_receipts_processed_total counter
truck_monitoring_receipts_processed_total{status="success",truck_id="123",driver_id="456"} 45

# HELP truck_monitoring_http_request_duration_seconds Duration of HTTP requests
# TYPE truck_monitoring_http_request_duration_seconds histogram
truck_monitoring_http_request_duration_seconds_bucket{method="POST",route="/api/receipts",status_code="200",le="0.1"} 120
```

## 🔍 **Health Check**

Enhanced health check with observability: `GET /health`

```json
{
  "status": "healthy",
  "timestamp": "2025-09-18T10:30:00.000Z",
  "service": "truck-monitoring-backend",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "checks": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## 🐛 **Troubleshooting**

### Common Issues

1. **Sentry not capturing errors**
   - Verify `SENTRY_DSN` is set correctly
   - Check network connectivity to Sentry
   - Ensure `initSentry()` is called before other imports

2. **Logs not appearing in CloudWatch**
   - Verify log group exists
   - Check IAM permissions for CloudWatch Logs
   - Ensure JSON format is enabled in production

3. **Prometheus metrics not updating**
   - Check `/metrics` endpoint responds
   - Verify Prometheus scrape configuration
   - Check for initialization errors

4. **High memory usage**
   - Monitor metric collection frequency
   - Check for memory leaks in custom metrics
   - Consider reducing metric cardinality

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug
SENTRY_DEBUG=true
```

## 📚 **Best Practices**

### Logging
- Use structured logging with consistent field names
- Include correlation IDs for request tracing
- Log business events for operational insights
- Avoid logging sensitive data (automatically redacted)

### Metrics
- Use appropriate metric types (counter, histogram, gauge)
- Keep label cardinality low (<100 unique combinations)
- Name metrics consistently with service prefix
- Track both technical and business metrics

### Error Tracking
- Add context to error captures
- Use breadcrumbs for debugging complex flows
- Set appropriate sample rates for production
- Tag errors with relevant metadata

## 🔗 **Useful Links**

- [Sentry Documentation](https://docs.sentry.io/platforms/node/)
- [Pino Documentation](https://getpino.io/)
- [Prometheus Node.js Client](https://github.com/siimon/prom-client)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

## 🤝 **Contributing**

When adding new features:
1. Add appropriate logging with context
2. Create relevant metrics for monitoring
3. Include error handling with Sentry
4. Update Grafana dashboards if needed
5. Document new observability features