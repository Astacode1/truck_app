import { 
  truckEventEmitter, 
  createEventHandler,
  ReceiptApprovedEvent,
  ReceiptRejectedEvent,
  TripAssignedEvent,
  AnomalyDetectedEvent,
  EventLogger
} from '../events/truck.events';
import { EmailService } from '../services/email/email.service';
import { SendGridEmailService } from '../services/email/sendgrid.service';
import { SESEmailService } from '../services/email/ses.service';

interface NotificationHandlerConfig {
  emailService?: {
    provider: 'sendgrid' | 'ses';
    config: any;
  };
  enableEmail?: boolean;
  enableLogging?: boolean;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Mock user service for demonstration
class MockUserService {
  private users: UserData[] = [
    {
      id: 'user-1',
      email: 'admin@trucking.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'ADMIN'
    },
    {
      id: 'driver-1',
      email: 'driver1@trucking.com',
      firstName: 'Mike',
      lastName: 'Driver',
      role: 'DRIVER'
    },
    {
      id: 'manager-1',
      email: 'manager@trucking.com',
      firstName: 'Sarah',
      lastName: 'Manager',
      role: 'MANAGER'
    }
  ];

  async getUserById(id: string): Promise<UserData | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUsersByRole(role: string): Promise<UserData[]> {
    return this.users.filter(user => user.role === role);
  }

  async getAllManagers(): Promise<UserData[]> {
    return this.users.filter(user => user.role === 'MANAGER' || user.role === 'ADMIN');
  }
}

export class NotificationHandlers {
  private emailService?: EmailService;
  private userService: MockUserService;
  private config: NotificationHandlerConfig;

  constructor(config: NotificationHandlerConfig = {}) {
    this.config = config;
    this.userService = new MockUserService();
    
    if (config.emailService) {
      this.initializeEmailService(config.emailService);
    }

    this.registerHandlers();
  }

  private initializeEmailService(emailConfig: { provider: 'sendgrid' | 'ses'; config: any }): void {
    try {
      if (emailConfig.provider === 'sendgrid') {
        this.emailService = new SendGridEmailService(emailConfig.config);
      } else if (emailConfig.provider === 'ses') {
        this.emailService = new SESEmailService(emailConfig.config);
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  private registerHandlers(): void {
    // Receipt approved handler
    truckEventEmitter.onReceiptApproved(
      createEventHandler<ReceiptApprovedEvent>(async (event) => {
        await this.handleReceiptApproved(event);
      })
    );

    // Receipt rejected handler
    truckEventEmitter.onReceiptRejected(
      createEventHandler<ReceiptRejectedEvent>(async (event) => {
        await this.handleReceiptRejected(event);
      })
    );

    // Trip assigned handler
    truckEventEmitter.onTripAssigned(
      createEventHandler<TripAssignedEvent>(async (event) => {
        await this.handleTripAssigned(event);
      })
    );

    // Anomaly detected handler
    truckEventEmitter.onAnomalyDetected(
      createEventHandler<AnomalyDetectedEvent>(async (event) => {
        await this.handleAnomalyDetected(event);
      })
    );
  }

  private async handleReceiptApproved(event: ReceiptApprovedEvent): Promise<void> {
    try {
      if (this.config.enableLogging) {
        EventLogger.log('RECEIPT_APPROVED_HANDLER', event);
      }

      // Get user (driver) info
      const user = await this.userService.getUserById(event.userId);
      if (!user) {
        console.warn(`User ${event.userId} not found for receipt approval`);
        return;
      }

      // Send email notification if enabled
      if (this.config.enableEmail && this.emailService) {
        await this.emailService.sendEmail({
          to: user.email,
          subject: `Receipt Approved - $${event.amount}`,
          htmlContent: this.generateReceiptApprovedHTML(event, user),
          textContent: this.generateReceiptApprovedText(event, user),
        });
      }

      // Log successful processing
      if (this.config.enableLogging) {
        EventLogger.log('RECEIPT_APPROVED_PROCESSED', { receiptId: event.receiptId, userId: event.userId }, true);
      }

    } catch (error) {
      console.error('Error handling receipt approved event:', error);
      if (this.config.enableLogging) {
        EventLogger.log('RECEIPT_APPROVED_ERROR', { event, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  private async handleReceiptRejected(event: ReceiptRejectedEvent): Promise<void> {
    try {
      if (this.config.enableLogging) {
        EventLogger.log('RECEIPT_REJECTED_HANDLER', event);
      }

      // Get user (driver) info
      const user = await this.userService.getUserById(event.userId);
      if (!user) {
        console.warn(`User ${event.userId} not found for receipt rejection`);
        return;
      }

      // Send email notification if enabled
      if (this.config.enableEmail && this.emailService) {
        await this.emailService.sendEmail({
          to: user.email,
          subject: `Receipt Rejected - $${event.amount}`,
          htmlContent: this.generateReceiptRejectedHTML(event, user),
          textContent: this.generateReceiptRejectedText(event, user),
        });
      }

      // Log successful processing
      if (this.config.enableLogging) {
        EventLogger.log('RECEIPT_REJECTED_PROCESSED', { receiptId: event.receiptId, userId: event.userId }, true);
      }

    } catch (error) {
      console.error('Error handling receipt rejected event:', error);
      if (this.config.enableLogging) {
        EventLogger.log('RECEIPT_REJECTED_ERROR', { event, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  private async handleTripAssigned(event: TripAssignedEvent): Promise<void> {
    try {
      if (this.config.enableLogging) {
        EventLogger.log('TRIP_ASSIGNED_HANDLER', event);
      }

      // Get driver info
      const driver = await this.userService.getUserById(event.driverId);
      if (!driver) {
        console.warn(`Driver ${event.driverId} not found for trip assignment`);
        return;
      }

      // Send email notification if enabled
      if (this.config.enableEmail && this.emailService) {
        await this.emailService.sendEmail({
          to: driver.email,
          subject: `New Trip Assignment - ${event.route.origin} to ${event.route.destination}`,
          htmlContent: this.generateTripAssignedHTML(event, driver),
          textContent: this.generateTripAssignedText(event, driver),
        });
      }

      // Log successful processing
      if (this.config.enableLogging) {
        EventLogger.log('TRIP_ASSIGNED_PROCESSED', { tripId: event.tripId, driverId: event.driverId }, true);
      }

    } catch (error) {
      console.error('Error handling trip assigned event:', error);
      if (this.config.enableLogging) {
        EventLogger.log('TRIP_ASSIGNED_ERROR', { event, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  private async handleAnomalyDetected(event: AnomalyDetectedEvent): Promise<void> {
    try {
      if (this.config.enableLogging) {
        EventLogger.log('ANOMALY_DETECTED_HANDLER', event);
      }

      // Get affected users
      const recipients: UserData[] = [];
      
      // Add driver if specified
      if (event.driverId) {
        const driver = await this.userService.getUserById(event.driverId);
        if (driver) recipients.push(driver);
      }

      // Add managers for critical anomalies
      if (event.severity === 'high' || event.severity === 'critical') {
        const managers = await this.userService.getAllManagers();
        recipients.push(...managers);
      }

      // Send notifications
      if (this.config.enableEmail && this.emailService && recipients.length > 0) {
        for (const recipient of recipients) {
          await this.emailService.sendEmail({
            to: recipient.email,
            subject: `${event.severity.toUpperCase()} Anomaly Detected - ${event.type}`,
            htmlContent: this.generateAnomalyDetectedHTML(event, recipient),
            textContent: this.generateAnomalyDetectedText(event, recipient),
          });
        }
      }

      // Log successful processing
      if (this.config.enableLogging) {
        EventLogger.log('ANOMALY_DETECTED_PROCESSED', { 
          anomalyId: event.anomalyId, 
          type: event.type, 
          severity: event.severity,
          recipientCount: recipients.length
        }, true);
      }

    } catch (error) {
      console.error('Error handling anomaly detected event:', error);
      if (this.config.enableLogging) {
        EventLogger.log('ANOMALY_DETECTED_ERROR', { event, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  // HTML email templates
  private generateReceiptApprovedHTML(event: ReceiptApprovedEvent, user: UserData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #e5e5e5; padding: 15px; text-align: center; font-size: 12px; }
          .success { color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Truck Monitoring System</h1>
            <h2>Receipt Approved ✅</h2>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p class="success">Your receipt has been approved!</p>
            <ul>
              <li><strong>Receipt ID:</strong> ${event.receiptId}</li>
              <li><strong>Amount:</strong> $${event.amount}</li>
              <li><strong>Approved by:</strong> ${event.approvedBy}</li>
              <li><strong>Date:</strong> ${event.timestamp.toLocaleDateString()}</li>
            </ul>
            <p>The amount will be processed for reimbursement.</p>
          </div>
          <div class="footer">
            <p>Truck Monitoring System - Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateReceiptRejectedHTML(event: ReceiptRejectedEvent, user: UserData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt Rejected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #e5e5e5; padding: 15px; text-align: center; font-size: 12px; }
          .error { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Truck Monitoring System</h1>
            <h2>Receipt Rejected ❌</h2>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p class="error">Your receipt has been rejected.</p>
            <ul>
              <li><strong>Receipt ID:</strong> ${event.receiptId}</li>
              <li><strong>Amount:</strong> $${event.amount}</li>
              <li><strong>Rejected by:</strong> ${event.rejectedBy}</li>
              <li><strong>Reason:</strong> ${event.reason}</li>
              <li><strong>Date:</strong> ${event.timestamp.toLocaleDateString()}</li>
            </ul>
            <p>Please review the reason and resubmit if necessary.</p>
          </div>
          <div class="footer">
            <p>Truck Monitoring System - Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTripAssignedHTML(event: TripAssignedEvent, driver: UserData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trip Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #e5e5e5; padding: 15px; text-align: center; font-size: 12px; }
          .info { color: #2563eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Truck Monitoring System</h1>
            <h2>New Trip Assignment 🚛</h2>
          </div>
          <div class="content">
            <p>Hello ${driver.firstName} ${driver.lastName},</p>
            <p class="info">You have been assigned a new trip!</p>
            <ul>
              <li><strong>Trip ID:</strong> ${event.tripId}</li>
              <li><strong>Vehicle ID:</strong> ${event.vehicleId}</li>
              <li><strong>From:</strong> ${event.route.origin}</li>
              <li><strong>To:</strong> ${event.route.destination}</li>
              <li><strong>Estimated Duration:</strong> ${Math.round(event.route.estimatedDuration / 60)} hours</li>
              <li><strong>Assigned by:</strong> ${event.assignedBy}</li>
              <li><strong>Date:</strong> ${event.timestamp.toLocaleDateString()}</li>
            </ul>
            <p>Please prepare for your trip and check in when you begin.</p>
          </div>
          <div class="footer">
            <p>Truck Monitoring System - Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAnomalyDetectedHTML(event: AnomalyDetectedEvent, user: UserData): string {
    const severityColor = {
      low: '#059669',
      medium: '#d97706',
      high: '#dc2626',
      critical: '#7c2d12'
    }[event.severity];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Anomaly Detected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${severityColor}; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #e5e5e5; padding: 15px; text-align: center; font-size: 12px; }
          .alert { color: ${severityColor}; font-weight: bold; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Truck Monitoring System</h1>
            <h2>Anomaly Detected ⚠️</h2>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p class="alert">${event.severity} severity anomaly detected!</p>
            <ul>
              <li><strong>Type:</strong> ${event.type.replace(/_/g, ' ').toUpperCase()}</li>
              <li><strong>Severity:</strong> ${event.severity.toUpperCase()}</li>
              ${event.driverId ? `<li><strong>Driver ID:</strong> ${event.driverId}</li>` : ''}
              ${event.vehicleId ? `<li><strong>Vehicle ID:</strong> ${event.vehicleId}</li>` : ''}
              ${event.tripId ? `<li><strong>Trip ID:</strong> ${event.tripId}</li>` : ''}
              ${event.location ? `<li><strong>Location:</strong> ${event.location.address || `${event.location.latitude}, ${event.location.longitude}`}</li>` : ''}
              <li><strong>Time:</strong> ${event.timestamp.toLocaleString()}</li>
            </ul>
            ${Object.keys(event.details).length > 0 ? `
              <h3>Details:</h3>
              <pre>${JSON.stringify(event.details, null, 2)}</pre>
            ` : ''}
            <p>Please investigate this anomaly immediately.</p>
          </div>
          <div class="footer">
            <p>Truck Monitoring System - Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Text email templates (simplified versions)
  private generateReceiptApprovedText(event: ReceiptApprovedEvent, user: UserData): string {
    return `
Receipt Approved

Hello ${user.firstName} ${user.lastName},

Your receipt has been approved!

Receipt ID: ${event.receiptId}
Amount: $${event.amount}
Approved by: ${event.approvedBy}
Date: ${event.timestamp.toLocaleDateString()}

The amount will be processed for reimbursement.

---
Truck Monitoring System - Automated Notification
    `.trim();
  }

  private generateReceiptRejectedText(event: ReceiptRejectedEvent, user: UserData): string {
    return `
Receipt Rejected

Hello ${user.firstName} ${user.lastName},

Your receipt has been rejected.

Receipt ID: ${event.receiptId}
Amount: $${event.amount}
Rejected by: ${event.rejectedBy}
Reason: ${event.reason}
Date: ${event.timestamp.toLocaleDateString()}

Please review the reason and resubmit if necessary.

---
Truck Monitoring System - Automated Notification
    `.trim();
  }

  private generateTripAssignedText(event: TripAssignedEvent, driver: UserData): string {
    return `
New Trip Assignment

Hello ${driver.firstName} ${driver.lastName},

You have been assigned a new trip!

Trip ID: ${event.tripId}
Vehicle ID: ${event.vehicleId}
From: ${event.route.origin}
To: ${event.route.destination}
Estimated Duration: ${Math.round(event.route.estimatedDuration / 60)} hours
Assigned by: ${event.assignedBy}
Date: ${event.timestamp.toLocaleDateString()}

Please prepare for your trip and check in when you begin.

---
Truck Monitoring System - Automated Notification
    `.trim();
  }

  private generateAnomalyDetectedText(event: AnomalyDetectedEvent, user: UserData): string {
    return `
Anomaly Detected

Hello ${user.firstName} ${user.lastName},

${event.severity.toUpperCase()} severity anomaly detected!

Type: ${event.type.replace(/_/g, ' ').toUpperCase()}
Severity: ${event.severity.toUpperCase()}
${event.driverId ? `Driver ID: ${event.driverId}` : ''}
${event.vehicleId ? `Vehicle ID: ${event.vehicleId}` : ''}
${event.tripId ? `Trip ID: ${event.tripId}` : ''}
${event.location ? `Location: ${event.location.address || `${event.location.latitude}, ${event.location.longitude}`}` : ''}
Time: ${event.timestamp.toLocaleString()}

${Object.keys(event.details).length > 0 ? `Details: ${JSON.stringify(event.details, null, 2)}` : ''}

Please investigate this anomaly immediately.

---
Truck Monitoring System - Automated Notification
    `.trim();
  }

  // Health check
  async healthCheck(): Promise<{
    handlers: boolean;
    email: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let handlers = false;
    let email = false;

    try {
      // Check if handlers are registered
      const stats = truckEventEmitter.getStats();
      handlers = Object.values(stats).some(count => count > 0);
      if (!handlers) {
        errors.push('No event handlers registered');
      }
    } catch (error: any) {
      errors.push(`Handlers: ${error.message}`);
    }

    if (this.emailService) {
      try {
        email = await this.emailService.healthCheck();
        if (!email) {
          errors.push('Email service health check failed');
        }
      } catch (error: any) {
        errors.push(`Email: ${error.message}`);
      }
    } else {
      errors.push('Email service not configured');
    }

    return { handlers, email, errors };
  }
}
