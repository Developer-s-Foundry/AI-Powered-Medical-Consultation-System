import sgMail from "@sendgrid/mail";
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
}

export interface SendTemplateEmailOptions {
  to: string;
  templateType: TemplateType;
  templateData: Record<string, unknown>;
  language?: string;
  from?: string;
  replyTo?: string;
}

sgMail.setApiKey(config.email.sendgridApiKey);

export class EmailService {
  /**
   * Send email with custom content
   */
  async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      if (!this.isValidEmail(options.to)) {
        throw new Error(`Invalid email address: ${options.to}`);
      }

      const msg = {
        to: options.to,
        from: options.from || config.email.from,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        ...(options.replyTo && { replyTo: options.replyTo }),
      };

      const [response] = await sgMail.send(msg);

      const messageId = response.headers["x-message-id"] as string | undefined;

      logger.info(`Email sent: to=${options.to}, messageId=${messageId}`);

      return { success: true, messageId };
    } catch (error) {
      logger.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(options: SendTemplateEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const rendered = await templateService.renderEmail(
        options.templateType,
        options.templateData,
        options.language || "en",
      );

      if (!rendered) {
        throw new Error("Failed to render email template");
      }

      return await this.sendEmail({
        to: options.to,
        subject: rendered.subject,
        html: rendered.body,
        from: options.from,
        replyTo: options.replyTo,
      });
    } catch (error) {
      logger.error("Error sending template email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
      results.push({ to: email.to, ...result });
      if (result.success) successful++;
      else failed++;
      await this.delay(100);
    }

    logger.info(
      `Bulk email completed: total=${emails.length}, successful=${successful}, failed=${failed}`,
    );

    return { total: emails.length, successful, failed, results };
  }

  /**
   * Verify SendGrid API key is set
   */
  async verifyConnection(): Promise<boolean> {
    if (!config.email.sendgridApiKey) {
      logger.error("SendGrid API key is not configured");
      return false;
    }
    logger.info("SendGrid API key is configured");
    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gms, "")
      .replace(/<script[^>]*>.*<\/script>/gms, "")
      .replace(/<[^>]+>/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new EmailService();
