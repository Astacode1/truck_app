// Email service interface for notification system
export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  sendAt?: Date;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface EmailServiceConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  templatePrefix?: string;
  sandbox?: boolean;
}

export interface EmailTemplate {
  id: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}

// Abstract EmailService interface
export abstract class EmailService {
  protected config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
  }

  // Core email sending method
  abstract sendEmail(emailData: EmailData): Promise<EmailResponse>;

  // Template-based email sending
  abstract sendTemplateEmail(
    templateId: string,
    templateData: Record<string, any>,
    recipients: string | string[],
    options?: Partial<EmailData>
  ): Promise<EmailResponse>;

  // Batch email sending
  abstract sendBulkEmails(emails: EmailData[]): Promise<EmailResponse[]>;

  // Template management
  abstract createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<string>;
  abstract updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<boolean>;
  abstract deleteTemplate(templateId: string): Promise<boolean>;
  abstract getTemplate(templateId: string): Promise<EmailTemplate | null>;

  // Delivery status and analytics
  abstract getDeliveryStatus(messageId: string): Promise<{
    status: 'pending' | 'delivered' | 'bounced' | 'failed';
    timestamp?: Date;
    error?: string;
  }>;

  // Health check
  abstract healthCheck(): Promise<boolean>;

  // Utility methods
  protected validateEmailData(emailData: EmailData): void {
    if (!emailData.to || (Array.isArray(emailData.to) && emailData.to.length === 0)) {
      throw new Error('Email recipients are required');
    }

    if (!emailData.subject) {
      throw new Error('Email subject is required');
    }

    if (!emailData.htmlContent && !emailData.textContent && !emailData.templateId) {
      throw new Error('Email content or template ID is required');
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  }

  protected sanitizeTemplateData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Basic HTML escaping for security
        sanitized[key] = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Email service factory
export class EmailServiceFactory {
  static create(provider: 'sendgrid' | 'ses', config: EmailServiceConfig): EmailService {
    switch (provider) {
      case 'sendgrid':
        // Dynamic import to avoid loading unused providers
        const { SendGridEmailService } = require('./sendgrid.service');
        return new SendGridEmailService(config);
      
      case 'ses':
        const { SESEmailService } = require('./ses.service');
        return new SESEmailService(config);
      
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }
}

// Rate limiting interface for email providers
export interface RateLimitConfig {
  maxEmailsPerSecond: number;
  maxEmailsPerMinute: number;
  maxEmailsPerHour: number;
  maxEmailsPerDay: number;
}

export class RateLimiter {
  private counters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private config: RateLimitConfig) {}

  async checkLimit(key: string, period: 'second' | 'minute' | 'hour' | 'day'): Promise<boolean> {
    const now = Date.now();
    const periodMs = this.getPeriodMs(period);
    const maxCount = this.getMaxCount(period);
    
    const counterKey = `${key}:${period}`;
    const counter = this.counters.get(counterKey);
    
    if (!counter || now >= counter.resetTime) {
      this.counters.set(counterKey, { count: 1, resetTime: now + periodMs });
      return true;
    }
    
    if (counter.count >= maxCount) {
      return false;
    }
    
    counter.count++;
    return true;
  }

  private getPeriodMs(period: string): number {
    switch (period) {
      case 'second': return 1000;
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      default: return 1000;
    }
  }

  private getMaxCount(period: string): number {
    switch (period) {
      case 'second': return this.config.maxEmailsPerSecond;
      case 'minute': return this.config.maxEmailsPerMinute;
      case 'hour': return this.config.maxEmailsPerHour;
      case 'day': return this.config.maxEmailsPerDay;
      default: return 1;
    }
  }
}
