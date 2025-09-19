import { PrismaClient, NotificationType, User, Notification } from '@prisma/client';
import { EmailService } from './email/email.service';
import { SendGridEmailService } from './email/sendgrid.service';
import { SESEmailService } from './email/ses.service';

interface NotificationPayload {
  receiptId?: string;
  tripId?: string;
  driverId?: string;
  vehicleId?: string;
  anomalyType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
}

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  payload?: NotificationPayload;
  sendEmail?: boolean;
  emailTemplateId?: string;
  priority?: 'low' | 'normal' | 'high';
}

interface EmailConfig {
  provider: 'sendgrid' | 'ses';
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
    templatePrefix?: string;
  };
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    fromEmail: string;
    fromName: string;
    templatePrefix?: string;
  };
}

export class NotificationService {
  private prisma: PrismaClient;
  private emailService?: EmailService;
  private emailConfig?: EmailConfig;

  constructor(prisma: PrismaClient, emailConfig?: EmailConfig) {
    this.prisma = prisma;
    this.emailConfig = emailConfig;
    
    if (emailConfig) {
      this.initializeEmailService();
    }
  }

  private initializeEmailService(): void {
    if (!this.emailConfig) return;

    try {
      if (this.emailConfig.provider === 'sendgrid' && this.emailConfig.sendgrid) {
        this.emailService = new SendGridEmailService({
          apiKey: this.emailConfig.sendgrid.apiKey,
          fromEmail: this.emailConfig.sendgrid.fromEmail,
          fromName: this.emailConfig.sendgrid.fromName,
          templatePrefix: this.emailConfig.sendgrid.templatePrefix,
          rateLimiting: {
            maxEmailsPerSecond: 2,
            maxEmailsPerMinute: 100,
            maxEmailsPerHour: 1000,
            maxEmailsPerDay: 10000,
          },
        });
      } else if (this.emailConfig.provider === 'ses' && this.emailConfig.ses) {
        this.emailService = new SESEmailService({
          apiKey: '', // SES uses accessKeyId/secretAccessKey
          fromEmail: this.emailConfig.ses.fromEmail,
          fromName: this.emailConfig.ses.fromName,
          region: this.emailConfig.ses.region,
          accessKeyId: this.emailConfig.ses.accessKeyId,
          secretAccessKey: this.emailConfig.ses.secretAccessKey,
          templatePrefix: this.emailConfig.ses.templatePrefix,
          rateLimiting: {
            maxEmailsPerSecond: 4,
            maxEmailsPerMinute: 200,
            maxEmailsPerHour: 10000,
            maxEmailsPerDay: 200000,
          },
        });
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async createNotification(data: NotificationData): Promise<Notification> {
    try {
      // Create in-app notification
      const notification = await this.prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId,
          payload: data.payload ? JSON.stringify(data.payload) : null,
          read: false,
        },
      });

      // Send email if requested and service is available
      if (data.sendEmail && this.emailService) {
        await this.sendEmailNotification(data, notification.id);
      }

      return notification;

    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(
    data: NotificationData,
    notificationId: string
  ): Promise<void> {
    if (!this.emailService) {
      console.warn('Email service not configured');
      return;
    }

    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        include: {
          notificationPreferences: true,
        },
      });

      if (!user || !user.email) {
        console.warn(`User ${data.userId} not found or has no email`);
        return;
      }

      // Check if user wants email notifications for this type
      const emailEnabled = user.notificationPreferences?.emailEnabled ?? true;
      const typeEnabled = this.isNotificationTypeEnabled(
        user.notificationPreferences,
        data.type
      );

      if (!emailEnabled || !typeEnabled) {
        console.log(`Email notifications disabled for user ${data.userId}, type ${data.type}`);
        return;
      }

      // Prepare email data
      const templateData = {
        userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        title: data.title,
        message: data.message,
        notificationId,
        unsubscribeLink: `${process.env.FRONTEND_URL}/notifications/unsubscribe?token=${user.id}`,
        ...data.payload,
      };

      // Send email using template or plain content
      if (data.emailTemplateId) {
        await this.emailService.sendTemplateEmail(
          data.emailTemplateId,
          templateData,
          user.email
        );
      } else {
        await this.emailService.sendEmail({
          to: user.email,
          subject: data.title,
          htmlContent: this.generateDefaultEmailHTML(data, templateData),
          textContent: this.generateDefaultEmailText(data, templateData),
        });
      }

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  private isNotificationTypeEnabled(
    preferences: any,
    type: NotificationType
  ): boolean {
    if (!preferences) return true;

    const typeMap: Record<NotificationType, string> = {
      RECEIPT_APPROVED: 'receiptApproved',
      RECEIPT_REJECTED: 'receiptRejected',
      TRIP_ASSIGNED: 'tripAssigned',
      ANOMALY_DETECTED: 'anomalyDetected',
      SYSTEM_ALERT: 'systemAlerts',
      MAINTENANCE_DUE: 'maintenanceDue',
      FUEL_LOW: 'fuelLow',
      SPEED_VIOLATION: 'speedViolation',
      ROUTE_DEVIATION: 'routeDeviation',
    };

    const prefKey = typeMap[type];
    return prefKey ? preferences[prefKey] ?? true : true;
  }

  private generateDefaultEmailHTML(
    data: NotificationData,
    templateData: any
  ): string {
    const priorityColor = data.priority === 'high' ? '#dc2626' : '#059669';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${priorityColor}; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #e5e5e5; padding: 15px; text-align: center; font-size: 12px; }
          .button { display: inline-block; background: ${priorityColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Truck Monitoring System</h1>
            <h2>${data.title}</h2>
          </div>
          <div class="content">
            <p>Hello ${templateData.userName},</p>
            <p>${data.message}</p>
            ${data.payload?.details ? `<p><strong>Details:</strong> ${JSON.stringify(data.payload.details, null, 2)}</p>` : ''}
            <p>
              <a href="${process.env.FRONTEND_URL}/notifications" class="button">View Notification</a>
            </p>
          </div>
          <div class="footer">
            <p>Truck Monitoring System - Automated Notification</p>
            <p><a href="${templateData.unsubscribeLink}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateDefaultEmailText(
    data: NotificationData,
    templateData: any
  ): string {
    return `
Truck Monitoring System Notification

${data.title}

Hello ${templateData.userName},

${data.message}

${data.payload?.details ? `Details: ${JSON.stringify(data.payload.details, null, 2)}` : ''}

View your notifications: ${process.env.FRONTEND_URL}/notifications

---
Truck Monitoring System - Automated Notification
Unsubscribe: ${templateData.unsubscribeLink}
    `.trim();
  }

  async getNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: any = { userId };
    
    if (options.unreadOnly) {
      where.read = false;
    }
    
    if (options.type) {
      where.type = options.type;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
      return result.count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      emailEnabled?: boolean;
      receiptApproved?: boolean;
      receiptRejected?: boolean;
      tripAssigned?: boolean;
      anomalyDetected?: boolean;
      systemAlerts?: boolean;
      maintenanceDue?: boolean;
      fuelLow?: boolean;
      speedViolation?: boolean;
      routeDeviation?: boolean;
    }
  ): Promise<boolean> {
    try {
      await this.prisma.notificationPreference.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences,
        },
      });
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  async healthCheck(): Promise<{
    database: boolean;
    email: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let database = false;
    let email = false;

    try {
      await this.prisma.notification.findFirst();
      database = true;
    } catch (error: any) {
      errors.push(`Database: ${error.message}`);
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

    return { database, email, errors };
  }
}
