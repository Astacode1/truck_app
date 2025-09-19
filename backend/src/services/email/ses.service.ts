import { SESClient, SendEmailCommand, SendTemplatedEmailCommand, CreateTemplateCommand, UpdateTemplateCommand, DeleteTemplateCommand, GetTemplateCommand } from '@aws-sdk/client-ses';
import { EmailService, EmailData, EmailResponse, EmailTemplate, RateLimiter, RateLimitConfig } from './email.service';

interface SESConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  templatePrefix?: string;
  sandbox?: boolean;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  rateLimiting?: RateLimitConfig;
}

export class SESEmailService extends EmailService {
  private sesClient: SESClient;
  private rateLimiter?: RateLimiter;

  constructor(config: SESConfig) {
    super(config);
    
    this.sesClient = new SESClient({
      region: config.region || 'us-east-1',
      credentials: config.accessKeyId && config.secretAccessKey ? {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      } : undefined,
    });

    if (config.rateLimiting) {
      this.rateLimiter = new RateLimiter(config.rateLimiting);
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      this.validateEmailData(emailData);

      // Check rate limits
      if (this.rateLimiter) {
        const canSend = await this.rateLimiter.checkLimit('ses', 'minute');
        if (!canSend) {
          throw new Error('Rate limit exceeded');
        }
      }

      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
      const ccRecipients = emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc : [emailData.cc]) : [];
      const bccRecipients = emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc : [emailData.bcc]) : [];

      const command = new SendEmailCommand({
        Source: `${this.config.fromName} <${this.config.fromEmail}>`,
        Destination: {
          ToAddresses: recipients,
          CcAddresses: ccRecipients.length > 0 ? ccRecipients : undefined,
          BccAddresses: bccRecipients.length > 0 ? bccRecipients : undefined,
        },
        Message: {
          Subject: {
            Data: emailData.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: emailData.htmlContent ? {
              Data: emailData.htmlContent,
              Charset: 'UTF-8',
            } : undefined,
            Text: emailData.textContent ? {
              Data: emailData.textContent,
              Charset: 'UTF-8',
            } : undefined,
          },
        },
        ReplyToAddresses: this.config.replyTo ? [this.config.replyTo] : undefined,
        ConfigurationSetName: this.config.sandbox ? 'sandbox' : undefined,
      });

      const response = await this.sesClient.send(command);

      return {
        success: true,
        messageId: response.MessageId,
        provider: 'ses',
      };

    } catch (error: any) {
      console.error('SES email error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
        provider: 'ses',
      };
    }
  }

  async sendTemplateEmail(
    templateId: string,
    templateData: Record<string, any>,
    recipients: string | string[],
    options?: Partial<EmailData>
  ): Promise<EmailResponse> {
    try {
      // Check rate limits
      if (this.rateLimiter) {
        const canSend = await this.rateLimiter.checkLimit('ses', 'minute');
        if (!canSend) {
          throw new Error('Rate limit exceeded');
        }
      }

      const sanitizedData = this.sanitizeTemplateData(templateData);
      const fullTemplateId = this.config.templatePrefix ? 
        `${this.config.templatePrefix}_${templateId}` : templateId;

      const recipientList = Array.isArray(recipients) ? recipients : [recipients];
      const ccRecipients = options?.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : [];
      const bccRecipients = options?.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : [];

      const command = new SendTemplatedEmailCommand({
        Source: `${this.config.fromName} <${this.config.fromEmail}>`,
        Destination: {
          ToAddresses: recipientList,
          CcAddresses: ccRecipients.length > 0 ? ccRecipients : undefined,
          BccAddresses: bccRecipients.length > 0 ? bccRecipients : undefined,
        },
        Template: fullTemplateId,
        TemplateData: JSON.stringify(sanitizedData),
        ReplyToAddresses: this.config.replyTo ? [this.config.replyTo] : undefined,
        ConfigurationSetName: this.config.sandbox ? 'sandbox' : undefined,
      });

      const response = await this.sesClient.send(command);

      return {
        success: true,
        messageId: response.MessageId,
        provider: 'ses',
      };

    } catch (error: any) {
      console.error('SES template email error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send template email',
        provider: 'ses',
      };
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    
    // SES supports bulk sending, but we'll send individually for better error handling
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      // Small delay to respect rate limits
      if (this.rateLimiter) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<string> {
    try {
      const templateName = `${this.config.templatePrefix || 'truck'}_${Date.now()}`;
      
      const command = new CreateTemplateCommand({
        Template: {
          TemplateName: templateName,
          SubjectPart: template.subject,
          HtmlPart: template.htmlContent,
          TextPart: template.textContent,
        },
      });

      await this.sesClient.send(command);
      return templateName;

    } catch (error: any) {
      console.error('SES create template error:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<boolean> {
    try {
      // Get current template
      const currentTemplate = await this.getTemplate(templateId);
      if (!currentTemplate) {
        return false;
      }

      const command = new UpdateTemplateCommand({
        Template: {
          TemplateName: templateId,
          SubjectPart: template.subject || currentTemplate.subject,
          HtmlPart: template.htmlContent || currentTemplate.htmlContent,
          TextPart: template.textContent || currentTemplate.textContent,
        },
      });

      await this.sesClient.send(command);
      return true;

    } catch (error: any) {
      console.error('SES update template error:', error);
      return false;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const command = new DeleteTemplateCommand({
        TemplateName: templateId,
      });

      await this.sesClient.send(command);
      return true;

    } catch (error: any) {
      console.error('SES delete template error:', error);
      return false;
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const command = new GetTemplateCommand({
        TemplateName: templateId,
      });

      const response = await this.sesClient.send(command);
      
      if (!response.Template) {
        return null;
      }

      return {
        id: response.Template.TemplateName!,
        subject: response.Template.SubjectPart || '',
        htmlContent: response.Template.HtmlPart || '',
        textContent: response.Template.TextPart || '',
        variables: this.extractVariables(response.Template.HtmlPart || ''),
      };

    } catch (error: any) {
      console.error('SES get template error:', error);
      return null;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<{
    status: 'pending' | 'delivered' | 'bounced' | 'failed';
    timestamp?: Date;
    error?: string;
  }> {
    // SES doesn't provide a direct API to check message status by Message ID
    // This would typically be implemented using SES Event Publishing to SNS/CloudWatch
    // For now, we'll return a default status
    return {
      status: 'pending',
      error: 'SES delivery status requires event publishing setup',
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Try to get sending statistics as a health check
      const { SESClient, GetSendStatisticsCommand } = await import('@aws-sdk/client-ses');
      const command = new GetSendStatisticsCommand({});
      await this.sesClient.send(command);
      return true;

    } catch (error: any) {
      console.error('SES health check error:', error);
      return false;
    }
  }

  private extractVariables(htmlContent: string): string[] {
    // SES uses {{variable}} syntax
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(htmlContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }
}

// SES-specific configuration helper
export class SESConfigBuilder {
  private config: Partial<SESConfig> = {};

  credentials(accessKeyId: string, secretAccessKey: string): this {
    this.config.accessKeyId = accessKeyId;
    this.config.secretAccessKey = secretAccessKey;
    return this;
  }

  region(region: string): this {
    this.config.region = region;
    return this;
  }

  from(email: string, name: string): this {
    this.config.fromEmail = email;
    this.config.fromName = name;
    return this;
  }

  replyTo(email: string): this {
    this.config.replyTo = email;
    return this;
  }

  templatePrefix(prefix: string): this {
    this.config.templatePrefix = prefix;
    return this;
  }

  sandbox(enabled: boolean = true): this {
    this.config.sandbox = enabled;
    return this;
  }

  rateLimiting(config: RateLimitConfig): this {
    this.config.rateLimiting = config;
    return this;
  }

  build(): SESConfig {
    if (!this.config.fromEmail) {
      throw new Error('From email is required');
    }
    if (!this.config.fromName) {
      throw new Error('From name is required');
    }

    return this.config as SESConfig;
  }
}
