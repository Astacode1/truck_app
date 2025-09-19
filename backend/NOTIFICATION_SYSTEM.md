# Truck Monitoring System - Notification Subsystem

## Overview

The notification subsystem provides comprehensive email and in-app notification capabilities for the truck monitoring system. It supports multiple email providers, event-driven architecture, queue-based processing, and customizable templates.

## Features

- **Multi-Provider Email Support**: SendGrid and AWS SES implementations
- **Event-Driven Architecture**: Real-time notifications for system events
- **Queue-Based Processing**: Reliable message delivery with Redis/BullMQ
- **Rich Email Templates**: HTML and text email templates for all event types
- **Rate Limiting**: Built-in rate limiting for email providers
- **Health Monitoring**: Comprehensive health checks for all components
- **User Preferences**: Configurable notification preferences per user

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Event System   │───▶│   Notification  │
│    Services     │    │   (EventEmitter) │    │    Handlers     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────┐               ▼
                       │   Email Queue   │◀─────┌─────────────────┐
                       │   (BullMQ)      │      │  NotificationQueue │
                       └─────────────────┘      └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Email Services  │    │   Database      │
                       │ (SendGrid/SES)  │    │ (Notifications) │
                       └─────────────────┘    └─────────────────┘
```

## Components

### 1. Database Models

**Notification Model** (`prisma/schema.prisma`)
```prisma
model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  title     String
  message   String
  payload   String?          // JSON data
  read      Boolean          @default(false)
  readAt    DateTime?
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@index([userId, read])
  @@index([createdAt])
}
```

**NotificationPreference Model**
```prisma
model NotificationPreference {
  id               String  @id @default(cuid())
  userId           String  @unique
  user             User    @relation(fields: [userId], references: [id])
  emailEnabled     Boolean @default(true)
  receiptApproved  Boolean @default(true)
  receiptRejected  Boolean @default(true)
  tripAssigned     Boolean @default(true)
  anomalyDetected  Boolean @default(true)
  // ... other preferences
}
```

### 2. Email Services

**Abstract EmailService Interface** (`src/services/email/email.service.ts`)
- Template management
- Rate limiting
- Bulk sending
- Delivery tracking
- Health checks

**SendGrid Implementation** (`src/services/email/sendgrid.service.ts`)
```typescript
const emailService = new SendGridEmailService({
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: 'noreply@trucking.com',
  fromName: 'Truck Monitoring System',
  rateLimiting: {
    maxEmailsPerSecond: 2,
    maxEmailsPerMinute: 100,
    maxEmailsPerHour: 1000,
    maxEmailsPerDay: 10000,
  },
});
```

**AWS SES Implementation** (`src/services/email/ses.service.ts`)
```typescript
const emailService = new SESEmailService({
  apiKey: '', // Uses accessKeyId/secretAccessKey
  fromEmail: 'noreply@trucking.com',
  fromName: 'Truck Monitoring System',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
```

### 3. Event System

**Event Types** (`src/events/truck.events.ts`)
- `RECEIPT_APPROVED`
- `RECEIPT_REJECTED`
- `TRIP_ASSIGNED`
- `ANOMALY_DETECTED`
- `SYSTEM_ALERT`
- `MAINTENANCE_DUE`

**Usage Example**
```typescript
import { truckEventEmitter } from './events/truck.events';

// Emit receipt approval event
truckEventEmitter.emitReceiptApproved({
  receiptId: 'receipt-123',
  userId: 'driver-1',
  driverId: 'driver-1',
  amount: 45.67,
  approvedBy: 'manager-1',
  timestamp: new Date(),
});
```

### 4. Notification Handlers

**Event Handlers** (`src/handlers/notification.handlers.ts`)
- Automatically respond to events
- Generate appropriate email content
- Handle user preferences
- Log processing results

**Configuration**
```typescript
const handlers = new NotificationHandlers({
  enableEmail: true,
  enableLogging: true,
  emailService: {
    provider: 'sendgrid',
    config: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: 'noreply@trucking.com',
      fromName: 'Truck Monitoring System',
    },
  },
});
```

### 5. Queue System

**BullMQ Implementation** (`src/queues/notification.queue.ts`)
- Redis-backed queues
- Retry logic with exponential backoff
- Priority-based processing
- Job monitoring and statistics

**Usage**
```typescript
const queue = createNotificationQueue();

await queue.queueNotification({
  eventType: TruckEventType.RECEIPT_APPROVED,
  eventData: receiptEvent,
  recipientEmail: 'driver@trucking.com',
  recipientName: 'John Driver',
  priority: 'normal',
});
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @sendgrid/mail @aws-sdk/client-ses bullmq ioredis
```

### 2. Environment Variables

```bash
# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
FROM_EMAIL=noreply@trucking.com

# Queue System
REDIS_URL=redis://localhost:6379

# Application
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Run Prisma migration
npx prisma migrate dev --name add-notification-models

# Generate Prisma client
npx prisma generate
```

### 4. Redis Setup

For development, you can use Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

## Usage Examples

### Basic Email Sending

```typescript
import { SendGridEmailService } from './services/email/sendgrid.service';

const emailService = new SendGridEmailService({
  apiKey: process.env.SENDGRID_API_KEY!,
  fromEmail: 'noreply@trucking.com',
  fromName: 'Truck Monitoring System',
});

await emailService.sendEmail({
  to: 'driver@trucking.com',
  subject: 'Test Notification',
  htmlContent: '<h1>Hello Driver!</h1>',
  textContent: 'Hello Driver!',
});
```

### Event-Driven Notifications

```typescript
import { truckEventEmitter } from './events/truck.events';
import { NotificationHandlers } from './handlers/notification.handlers';

// Initialize handlers
const handlers = new NotificationHandlers({
  enableEmail: true,
  enableLogging: true,
  emailService: { /* email config */ },
});

// Emit events from your application
truckEventEmitter.emitReceiptApproved({
  receiptId: 'receipt-123',
  userId: 'driver-1',
  amount: 45.67,
  approvedBy: 'manager-1',
  timestamp: new Date(),
});
```

### Queue-Based Processing

```typescript
import { createNotificationQueue } from './queues/notification.queue';

const queue = createNotificationQueue();

// Queue notification for processing
await queue.queueNotification({
  eventType: TruckEventType.ANOMALY_DETECTED,
  eventData: anomalyEvent,
  recipientEmail: 'manager@trucking.com',
  recipientName: 'Sarah Manager',
  priority: 'high',
});

// Check queue statistics
const stats = await queue.getQueueStats();
console.log('Queue Stats:', stats);
```

### Integration with Receipt Verification

```typescript
import { ReceiptVerificationService } from './demo/notification.demo';

const receiptService = new ReceiptVerificationService();

// Approve receipt (triggers notification event)
await receiptService.approveReceipt('receipt-123', 'manager-1');

// Reject receipt (triggers notification event)
await receiptService.rejectReceipt('receipt-456', 'manager-1', 'Invalid receipt');
```

## Testing

### Demo Mode

```typescript
import { runNotificationDemo } from './demo/notification.demo';

// Run comprehensive demo
await runNotificationDemo();
```

### Queue Demo

```typescript
import { demoNotificationQueue } from './queues/notification.queue';

// Test queue system
await demoNotificationQueue();
```

### Health Checks

```typescript
// Check email service health
const emailHealth = await emailService.healthCheck();

// Check notification handlers health
const handlerHealth = await handlers.healthCheck();

// Check queue system health
const queueHealth = await queue.healthCheck();
```

## Configuration

### Email Provider Configuration

**SendGrid**
```typescript
{
  provider: 'sendgrid',
  config: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: 'noreply@trucking.com',
    fromName: 'Truck Monitoring System',
    templatePrefix: 'truck_monitoring',
    rateLimiting: {
      maxEmailsPerSecond: 2,
      maxEmailsPerMinute: 100,
      maxEmailsPerHour: 1000,
      maxEmailsPerDay: 10000,
    },
  },
}
```

**AWS SES**
```typescript
{
  provider: 'ses',
  config: {
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    fromEmail: 'noreply@trucking.com',
    fromName: 'Truck Monitoring System',
    rateLimiting: {
      maxEmailsPerSecond: 4,
      maxEmailsPerMinute: 200,
      maxEmailsPerHour: 10000,
      maxEmailsPerDay: 200000,
    },
  },
}
```

### Queue Configuration

```typescript
{
  redisUrl: 'redis://localhost:6379',
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
}
```

## Monitoring & Logging

### Event Logging

```typescript
import { EventLogger } from './events/truck.events';

// Get recent logs
const logs = EventLogger.getLogs(50);

// Get logs by type
const receiptLogs = EventLogger.getLogsByType('RECEIPT_APPROVED', 25);

// Clear logs
EventLogger.clearLogs();
```

### Queue Monitoring

```typescript
// Get queue statistics
const stats = await queue.getQueueStats();
console.log('Notifications:', stats.notifications);
console.log('Emails:', stats.emails);

// Health check
const health = await queue.healthCheck();
console.log('Redis:', health.redis);
console.log('Queues:', health.queues);
console.log('Workers:', health.workers);
```

## Error Handling

### Email Service Errors

- Automatic retry with exponential backoff
- Detailed error logging
- Graceful degradation when email service is unavailable

### Queue Processing Errors

- Failed jobs are retried with increasing delays
- Dead letter queue for permanently failed jobs
- Error logging and monitoring

### Event System Errors

- Individual event handler errors don't affect other handlers
- Comprehensive error logging
- Event processing continues even if some handlers fail

## Security Considerations

- Email content sanitization
- Rate limiting to prevent abuse
- API key protection
- User permission validation
- Secure Redis connections

## Performance

- Queue-based processing prevents blocking
- Redis-backed queues for reliability
- Configurable worker concurrency
- Efficient database indexing
- Rate limiting to prevent provider overuse

## Future Enhancements

- SMS notifications (Twilio integration)
- Push notifications for mobile apps
- Advanced email templates with dynamic content
- A/B testing for notification content
- Analytics and delivery tracking
- Template management UI
- Notification preferences UI

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify REDIS_URL environment variable
   - Check network connectivity

2. **Email Not Sending**
   - Verify API keys are correct
   - Check rate limiting settings
   - Ensure from email is verified with provider

3. **Events Not Triggering**
   - Verify event handlers are registered
   - Check event emitter is imported correctly
   - Review event data structure

4. **Queue Jobs Failing**
   - Check Redis connectivity
   - Verify worker processes are running
   - Review job error logs

### Debug Mode

Enable debug logging:
```typescript
const handlers = new NotificationHandlers({
  enableLogging: true,
  // ... other config
});
```

This comprehensive notification subsystem provides a robust foundation for all notification needs in the truck monitoring system, with support for multiple providers, reliable delivery, and comprehensive monitoring capabilities.
