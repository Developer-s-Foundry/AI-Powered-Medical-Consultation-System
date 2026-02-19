import { Transporter } from "nodemailer";
import emailTransporter from "../config/email";
import config from "../config";
import logger from "../utils/logger";
import { TemplateType } from "../@types/template.types";
import templateService from "./TemplateService";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

export interface SendTemplateEmailOptions {
  to: string;
  templateType: TemplateType;
  templateData: Record<string, any>;
  language?: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = emailTransporter;
  }

  /**
   * Send email with custom content
   */
  async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    response?: string;
    error?: string;
  }> {
    try {
      // Validate email address
      if (!this.isValidEmail(options.to)) {
        throw new Error(`Invalid email address: ${options.to}`);
      }

      // Send email
      const info = await this.transporter.sendMail({
        from: options.from || config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      logger.info(
        `Email sent successfully: to=${options.to}, messageId=${info.messageId}`,
      );

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      logger.error("Error sending email:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(options: SendTemplateEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    response?: string;
    error?: string;
  }> {
    try {
      // Render template
      const rendered = await templateService.renderEmail(
        options.templateType,
        options.templateData,
        options.language || "en",
      );

      if (!rendered) {
        throw new Error("Failed to render email template");
      }

      // Send email
      return await this.sendEmail({
        to: options.to,
        subject: rendered.subject,
        html: rendered.body,
        from: options.from,
        replyTo: options.replyTo,
      });
    } catch (error: any) {
      logger.error("Error sending template email:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: SendEmailOptions[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{
      to: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    const results: Array<{
      to: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    let successful = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail(email);

      results.push({
        to: email.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Small delay to avoid rate limiting
      await this.delay(100);
    }

    logger.info(
      `Bulk email send completed: total=${emails.length}, successful=${successful}, failed=${failed}`,
    );

    return {
      total: emails.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Verify email transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info("Email transporter connection verified");
      return true;
    } catch (error) {
      logger.error("Email transporter verification failed:", error);
      return false;
    }
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, "")
      .replace(/<script[^>]*>.*<\/script>/gm, "")
      .replace(/<[^>]+>/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get email provider info (for debugging)
   */
  getProviderInfo(): {
    host: string;
    port: number;
    secure: boolean;
  } {
    return {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
    };
  }
}

export default new EmailService();
