import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { 
  TruckEventType, 
  ReceiptApprovedEvent, 
  ReceiptRejectedEvent, 
  TripAssignedEvent, 
  AnomalyDetectedEvent,
  EventData 
} from '../events/truck.events';
import { EmailService } from '../services/email/email.service';

// Queue job data interfaces
interface NotificationJobData {
  eventType: TruckEventType;
  eventData: EventData;
  recipientEmail: string;
  recipientName: string;
  priority: 'low' | 'normal' | 'high';
  retryCount?: number;
}

interface EmailJobData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  priority: 'low' | 'normal' | 'high';
  retryCount?: number;
}

export class NotificationQueue {
  private redis: Redis;
  private notificationQueue: Queue<NotificationJobData>;
  private emailQueue: Queue<EmailJobData>;
  private notificationWorker: Worker<NotificationJobData>;
  private emailWorker: Worker<EmailJobData>;
  private emailService?: EmailService;

  constructor(
    redisUrl: string = 'redis://localhost:6379',
    emailService?: EmailService
  ) {
    // Initialize Redis connection
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    this.emailService = emailService;

    // Initialize queues
    this.notificationQueue = new Queue<NotificationJobData>('notifications', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.emailQueue = new Queue<EmailJobData>('emails', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    // Initialize workers
    this.notificationWorker = new Worker<NotificationJobData>(
      'notifications',
      this.processNotificationJob.bind(this),
      {
        connection: this.redis,
        concurrency: 5,
      }
    );

    this.emailWorker = new Worker<EmailJobData>(
      'emails',
      this.processEmailJob.bind(this),
      {
        connection: this.redis,
        concurrency: 3,
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Notification worker events
    this.notificationWorker.on('completed', (job: Job<NotificationJobData>) => {
      console.log(`✅ Notification job ${job.id} completed`);
    });

    this.notificationWorker.on('failed', (job: Job<NotificationJobData> | undefined, err: Error) => {
      console.error(`❌ Notification job ${job?.id} failed:`, err.message);
    });

    // Email worker events
    this.emailWorker.on('completed', (job: Job<EmailJobData>) => {
      console.log(`📧 Email job ${job.id} completed`);
    });

    this.emailWorker.on('failed', (job: Job<EmailJobData> | undefined, err: Error) => {
      console.error(`❌ Email job ${job?.id} failed:`, err.message);
    });

    // Connection events
    this.redis.on('connect', () => {
      console.log('📡 Connected to Redis');
    });

    this.redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
  }

  // Add notification to queue
  async queueNotification(data: NotificationJobData): Promise<string> {
    const priority = this.getPriorityNumber(data.priority);
    
    const job = await this.notificationQueue.add(
      `notification-${data.eventType}`,
      data,
      {
        priority,
        delay: data.priority === 'high' ? 0 : 1000, // High priority jobs execute immediately
      }
    );

    console.log(`📋 Queued notification job ${job.id} for ${data.eventType}`);
    return job.id!;
  }

  // Add email to queue
  async queueEmail(data: EmailJobData): Promise<string> {
    const priority = this.getPriorityNumber(data.priority);
    
    const job = await this.emailQueue.add(
      'send-email',
      data,
      {
        priority,
        delay: data.priority === 'high' ? 0 : 2000,
      }
    );

    console.log(`📧 Queued email job ${job.id} to ${data.to}`);
    return job.id!;
  }

  // Process notification job
  private async processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
    const { eventType, eventData, recipientEmail, recipientName, priority } = job.data;

    try {
      console.log(`🔄 Processing notification: ${eventType} for ${recipientEmail}`);

      // Generate email content based on event type
      const emailContent = this.generateEmailContent(eventType, eventData, recipientName);

      // Queue email for sending
      await this.queueEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        htmlContent: emailContent.htmlContent,
        textContent: emailContent.textContent,
        priority,
      });

      // Simulate processing delay for demo
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error processing notification job ${job.id}:`, error);
      throw error;
    }
  }

  // Process email job
  private async processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, htmlContent, textContent } = job.data;

    try {
      console.log(`📤 Sending email to ${to}: ${subject}`);

      if (this.emailService) {
        const result = await this.emailService.sendEmail({
          to,
          subject,
          htmlContent,
          textContent,
        });

        if (!result.success) {
          throw new Error(result.error || 'Email sending failed');
        }

        console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
      } else {
        // Simulate email sending when no email service is configured
        console.log(`📧 [DEMO MODE] Email would be sent to ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Content: ${textContent?.substring(0, 100)}...`);
      }

      // Simulate sending delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  // Generate email content based on event type
  private generateEmailContent(
    eventType: TruckEventType,
    eventData: EventData,
    recipientName: string
  ): { subject: string; htmlContent: string; textContent: string } {
    switch (eventType) {
      case TruckEventType.RECEIPT_APPROVED:
        const approvedEvent = eventData as ReceiptApprovedEvent;
        return {
          subject: `Receipt Approved - $${approvedEvent.amount}`,
          htmlContent: `
            <h2>Receipt Approved ✅</h2>
            <p>Hello ${recipientName},</p>
            <p>Your receipt for $${approvedEvent.amount} has been approved!</p>
            <p><strong>Receipt ID:</strong> ${approvedEvent.receiptId}</p>
            <p><strong>Approved by:</strong> ${approvedEvent.approvedBy}</p>
          `,
          textContent: `Receipt Approved - $${approvedEvent.amount}\n\nHello ${recipientName},\n\nYour receipt for $${approvedEvent.amount} has been approved!\nReceipt ID: ${approvedEvent.receiptId}\nApproved by: ${approvedEvent.approvedBy}`,
        };

      case TruckEventType.RECEIPT_REJECTED:
        const rejectedEvent = eventData as ReceiptRejectedEvent;
        return {
          subject: `Receipt Rejected - $${rejectedEvent.amount}`,
          htmlContent: `
            <h2>Receipt Rejected ❌</h2>
            <p>Hello ${recipientName},</p>
            <p>Your receipt for $${rejectedEvent.amount} has been rejected.</p>
            <p><strong>Receipt ID:</strong> ${rejectedEvent.receiptId}</p>
            <p><strong>Reason:</strong> ${rejectedEvent.reason}</p>
          `,
          textContent: `Receipt Rejected - $${rejectedEvent.amount}\n\nHello ${recipientName},\n\nYour receipt for $${rejectedEvent.amount} has been rejected.\nReceipt ID: ${rejectedEvent.receiptId}\nReason: ${rejectedEvent.reason}`,
        };

      case TruckEventType.TRIP_ASSIGNED:
        const tripEvent = eventData as TripAssignedEvent;
        return {
          subject: `New Trip Assignment - ${tripEvent.route.origin} to ${tripEvent.route.destination}`,
          htmlContent: `
            <h2>New Trip Assignment 🚛</h2>
            <p>Hello ${recipientName},</p>
            <p>You have been assigned a new trip!</p>
            <p><strong>Trip ID:</strong> ${tripEvent.tripId}</p>
            <p><strong>Vehicle:</strong> ${tripEvent.vehicleId}</p>
            <p><strong>Route:</strong> ${tripEvent.route.origin} → ${tripEvent.route.destination}</p>
          `,
          textContent: `New Trip Assignment\n\nHello ${recipientName},\n\nYou have been assigned a new trip!\nTrip ID: ${tripEvent.tripId}\nVehicle: ${tripEvent.vehicleId}\nRoute: ${tripEvent.route.origin} → ${tripEvent.route.destination}`,
        };

      case TruckEventType.ANOMALY_DETECTED:
        const anomalyEvent = eventData as AnomalyDetectedEvent;
        return {
          subject: `${anomalyEvent.severity.toUpperCase()} Anomaly Detected`,
          htmlContent: `
            <h2>Anomaly Detected ⚠️</h2>
            <p>Hello ${recipientName},</p>
            <p>A ${anomalyEvent.severity} severity anomaly has been detected.</p>
            <p><strong>Type:</strong> ${anomalyEvent.type}</p>
            <p><strong>Vehicle:</strong> ${anomalyEvent.vehicleId || 'Unknown'}</p>
            <p><strong>Driver:</strong> ${anomalyEvent.driverId || 'Unknown'}</p>
          `,
          textContent: `Anomaly Detected\n\nHello ${recipientName},\n\nA ${anomalyEvent.severity} severity anomaly has been detected.\nType: ${anomalyEvent.type}\nVehicle: ${anomalyEvent.vehicleId || 'Unknown'}\nDriver: ${anomalyEvent.driverId || 'Unknown'}`,
        };

      default:
        return {
          subject: 'Truck Monitoring System Notification',
          htmlContent: `<p>Hello ${recipientName},</p><p>You have a new notification from the Truck Monitoring System.</p>`,
          textContent: `Hello ${recipientName},\n\nYou have a new notification from the Truck Monitoring System.`,
        };
    }
  }

  // Convert priority string to number for BullMQ
  private getPriorityNumber(priority: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 1;
      case 'normal': return 5;
      case 'low': return 10;
      default: return 5;
    }
  }

  // Queue statistics
  async getQueueStats(): Promise<{
    notifications: any;
    emails: any;
  }> {
    const [notificationCounts, emailCounts] = await Promise.all([
      this.notificationQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
      this.emailQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    ]);

    return {
      notifications: notificationCounts,
      emails: emailCounts,
    };
  }

  // Health check
  async healthCheck(): Promise<{
    redis: boolean;
    queues: boolean;
    workers: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let redis = false;
    let queues = false;
    let workers = false;

    try {
      // Check Redis connection
      await this.redis.ping();
      redis = true;
    } catch (error) {
      errors.push(`Redis: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      // Check queues
      await this.getQueueStats();
      queues = true;
    } catch (error) {
      errors.push(`Queues: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      // Check workers (simplified check)
      workers = !this.notificationWorker.isRunning() === false && 
               !this.emailWorker.isRunning() === false;
    } catch (error) {
      errors.push(`Workers: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { redis, queues, workers, errors };
  }

  // Cleanup
  async close(): Promise<void> {
    console.log('🛑 Closing notification queue...');
    
    await Promise.all([
      this.notificationWorker.close(),
      this.emailWorker.close(),
      this.notificationQueue.close(),
      this.emailQueue.close(),
    ]);

    await this.redis.disconnect();
    console.log('✅ Notification queue closed');
  }
}

// Helper function to create and configure notification queue
export function createNotificationQueue(
  redisUrl?: string,
  emailService?: EmailService
): NotificationQueue {
  return new NotificationQueue(
    redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
    emailService
  );
}

// Demo function
export async function demoNotificationQueue(): Promise<void> {
  console.log('🚛 Notification Queue Demo\n');

  const queue = createNotificationQueue();

  try {
    // Wait for Redis connection
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check health
    const health = await queue.healthCheck();
    console.log('Health Check:', health);

    // Queue some notifications
    await queue.queueNotification({
      eventType: TruckEventType.RECEIPT_APPROVED,
      eventData: {
        receiptId: 'receipt-123',
        userId: 'driver-1',
        driverId: 'driver-1',
        amount: 45.67,
        approvedBy: 'manager-1',
        timestamp: new Date(),
      } as ReceiptApprovedEvent,
      recipientEmail: 'driver@example.com',
      recipientName: 'John Driver',
      priority: 'normal',
    });

    await queue.queueNotification({
      eventType: TruckEventType.ANOMALY_DETECTED,
      eventData: {
        anomalyId: 'anomaly-456',
        type: 'speed_violation',
        severity: 'high',
        driverId: 'driver-1',
        vehicleId: 'truck-001',
        details: { speedLimit: 65, recordedSpeed: 78 },
        timestamp: new Date(),
      } as AnomalyDetectedEvent,
      recipientEmail: 'manager@example.com',
      recipientName: 'Sarah Manager',
      priority: 'high',
    });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check stats
    const stats = await queue.getQueueStats();
    console.log('Queue Stats:', stats);

  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    await queue.close();
  }
}
