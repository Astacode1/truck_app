import sgMail from '@sendgrid/mail';
import { EmailService, EmailData, EmailResponse, EmailTemplate, RateLimiter, RateLimitConfig } from './email.service';

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  templatePrefix?: string;
  sandbox?: boolean;
  rateLimiting?: RateLimitConfig;
}

export class SendGridEmailService extends EmailService {
  private rateLimiter?: RateLimiter;

  constructor(config: SendGridConfig) {
    super(config);
    sgMail.setApiKey(config.apiKey);
    
    if (config.rateLimiting) {
      this.rateLimiter = new RateLimiter(config.rateLimiting);
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      this.validateEmailData(emailData);

      // Check rate limits
      if (this.rateLimiter) {
        const canSend = await this.rateLimiter.checkLimit('sendgrid', 'minute');
        if (!canSend) {
          throw new Error('Rate limit exceeded');
        }
      }

      const msg: any = {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        replyTo: this.config.replyTo,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
        attachments: this.formatAttachments(emailData.attachments),
        mailSettings: {
          sandboxMode: {
            enable: this.config.sandbox || false,
          },
        },
      };

      // Handle scheduled sending
      if (emailData.sendAt) {
        msg.sendAt = Math.floor(emailData.sendAt.getTime() / 1000);
      }

      // Set priority
      if (emailData.priority) {
        msg.priority = emailData.priority === 'high' ? 1 : emailData.priority === 'low' ? 5 : 3;
      }

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        provider: 'sendgrid',
      };

    } catch (error: any) {
      console.error('SendGrid email error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
        provider: 'sendgrid',
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
        const canSend = await this.rateLimiter.checkLimit('sendgrid', 'minute');
        if (!canSend) {
          throw new Error('Rate limit exceeded');
        }
      }

      const sanitizedData = this.sanitizeTemplateData(templateData);
      const fullTemplateId = this.config.templatePrefix ? 
        `${this.config.templatePrefix}_${templateId}` : templateId;

      const msg: any = {
        to: recipients,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        replyTo: this.config.replyTo,
        templateId: fullTemplateId,
        dynamicTemplateData: sanitizedData,
        mailSettings: {
          sandboxMode: {
            enable: this.config.sandbox || false,
          },
        },
      };

      // Apply additional options
      if (options) {
        if (options.cc) msg.cc = options.cc;
        if (options.bcc) msg.bcc = options.bcc;
        if (options.attachments) msg.attachments = this.formatAttachments(options.attachments);
        if (options.sendAt) msg.sendAt = Math.floor(options.sendAt.getTime() / 1000);
        if (options.priority) {
          msg.priority = options.priority === 'high' ? 1 : options.priority === 'low' ? 5 : 3;
        }
      }

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        provider: 'sendgrid',
      };

    } catch (error: any) {
      console.error('SendGrid template email error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send template email',
        provider: 'sendgrid',
      };
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    
    // SendGrid allows batch sending, but we'll send them individually for better error handling
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
      const response = await fetch('https://api.sendgrid.com/v3/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.subject,
          generation: 'dynamic',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`);
      }

      const templateData = await response.json();
      const templateId = templateData.id;

      // Create version with content
      const versionResponse = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}/versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: 1,
          name: template.subject,
          subject: template.subject,
          html_content: template.htmlContent,
          plain_content: template.textContent || '',
        }),
      });

      if (!versionResponse.ok) {
        throw new Error(`Failed to create template version: ${versionResponse.statusText}`);
      }

      return templateId;

    } catch (error: any) {
      console.error('SendGrid create template error:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<boolean> {
    try {
      // Get current template to update the latest version
      const templateResponse = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!templateResponse.ok) {
        return false;
      }

      const templateData = await templateResponse.json();
      const latestVersion = templateData.versions[0];

      // Update the template version
      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}/versions/${latestVersion.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: template.subject || latestVersion.subject,
          html_content: template.htmlContent || latestVersion.html_content,
          plain_content: template.textContent || latestVersion.plain_content,
        }),
      });

      return response.ok;

    } catch (error: any) {
      console.error('SendGrid update template error:', error);
      return false;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;

    } catch (error: any) {
      console.error('SendGrid delete template error:', error);
      return false;
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const templateData = await response.json();
      const latestVersion = templateData.versions[0];

      return {
        id: templateData.id,
        subject: latestVersion.subject,
        htmlContent: latestVersion.html_content,
        textContent: latestVersion.plain_content,
        variables: this.extractVariables(latestVersion.html_content),
      };

    } catch (error: any) {
      console.error('SendGrid get template error:', error);
      return null;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<{
    status: 'pending' | 'delivered' | 'bounced' | 'failed';
    timestamp?: Date;
    error?: string;
  }> {
    try {
      // SendGrid's Event Webhook or Activity API would be used here
      // This is a simplified implementation
      const response = await fetch(`https://api.sendgrid.com/v3/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return { status: 'failed', error: 'Message not found' };
      }

      const data = await response.json();
      
      return {
        status: this.mapSendGridStatus(data.status),
        timestamp: data.last_event_time ? new Date(data.last_event_time) : undefined,
      };

    } catch (error: any) {
      console.error('SendGrid delivery status error:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;

    } catch (error: any) {
      console.error('SendGrid health check error:', error);
      return false;
    }
  }

  private formatAttachments(attachments?: any[]): any[] | undefined {
    if (!attachments) return undefined;

    return attachments.map(attachment => ({
      content: Buffer.isBuffer(attachment.content) 
        ? attachment.content.toString('base64')
        : Buffer.from(attachment.content).toString('base64'),
      filename: attachment.filename,
      type: attachment.contentType,
      disposition: attachment.disposition || 'attachment',
      content_id: attachment.contentId,
    }));
  }

  private extractVariables(htmlContent: string): string[] {
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

  private mapSendGridStatus(status: string): 'pending' | 'delivered' | 'bounced' | 'failed' {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'delivered';
      case 'bounce':
      case 'blocked':
        return 'bounced';
      case 'dropped':
      case 'spam_report':
      case 'unsubscribe':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

// SendGrid-specific configuration helper
export class SendGridConfigBuilder {
  private config: Partial<SendGridConfig> = {};

  apiKey(key: string): this {
    this.config.apiKey = key;
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

  build(): SendGridConfig {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required');
    }
    if (!this.config.fromEmail) {
      throw new Error('From email is required');
    }
    if (!this.config.fromName) {
      throw new Error('From name is required');
    }

    return this.config as SendGridConfig;
  }
}
