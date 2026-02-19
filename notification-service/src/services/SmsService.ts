import twilioClient, { twilioPhoneNumber } from "../config/sms";
import logger from "../utils/logger";
import { TemplateType } from "../@types/template.types";
import templateService from "./TemplateService";

export interface SendSmsOptions {
  to: string;
  message: string;
  from?: string;
}

export interface SendTemplateSmsOptions {
  to: string;
  templateType: TemplateType;
  templateData: Record<string, any>;
  language?: string;
}

export class SmsService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured =
      twilioClient !== null && twilioPhoneNumber !== undefined;

    if (!this.isConfigured) {
      logger.warn("SMS service not configured - SMS sending will be skipped");
    }
  }

  /**
   * Send SMS with custom content
   */
  async sendSms(options: SendSmsOptions): Promise<{
    success: boolean;
    messageId?: string;
    status?: string;
    error?: string;
  }> {
    try {
      // Check if SMS is configured
      if (!this.isConfigured || !twilioClient) {
        logger.warn("SMS service not configured - skipping SMS send");
        return {
          success: false,
          error: "SMS service not configured",
        };
      }

      // Validate phone number
      if (!this.isValidPhoneNumber(options.to)) {
        throw new Error(`Invalid phone number: ${options.to}`);
      }

      // Validate message length
      if (options.message.length > 1600) {
        throw new Error("SMS message too long (max 1600 characters)");
      }

      // Send SMS
      const message = await twilioClient.messages.create({
        body: options.message,
        from: options.from || twilioPhoneNumber,
        to: this.formatPhoneNumber(options.to),
      });

      logger.info(
        `SMS sent successfully: to=${options.to}, sid=${message.sid}`,
      );

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
      };
    } catch (error: any) {
      logger.error("Error sending SMS:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Send SMS using template
   */
  async sendTemplateSms(options: SendTemplateSmsOptions): Promise<{
    success: boolean;
    messageId?: string;
    status?: string;
    error?: string;
  }> {
    try {
      // Render template
      const rendered = await templateService.renderSms(
        options.templateType,
        options.templateData,
        options.language || "en",
      );

      if (!rendered) {
        throw new Error("Failed to render SMS template");
      }

      // Send SMS
      return await this.sendSms({
        to: options.to,
        message: rendered,
      });
    } catch (error: any) {
      logger.error("Error sending template SMS:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(messages: SendSmsOptions[]): Promise<{
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

    for (const sms of messages) {
      const result = await this.sendSms(sms);

      results.push({
        to: sms.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Delay to avoid rate limiting
      await this.delay(100);
    }

    logger.info(
      `Bulk SMS send completed: total=${messages.length}, successful=${successful}, failed=${failed}`,
    );

    return {
      total: messages.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Get SMS status
   */
  async getSmsStatus(messageId: string): Promise<{
    status: string;
    errorCode?: number;
    errorMessage?: string;
  } | null> {
    try {
      if (!this.isConfigured || !twilioClient) {
        return null;
      }

      const message = await twilioClient.messages(messageId).fetch();

      return {
        status: message.status,
        errorCode: message.errorCode || undefined,
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      logger.error("Error fetching SMS status:", error);
      return null;
    }
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation - must start with + and contain 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number (ensure it starts with +)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, "");

    // Ensure it starts with +
    if (!cleaned.startsWith("+")) {
      // Assume Nigeria if no country code
      if (cleaned.startsWith("0")) {
        cleaned = "+234" + cleaned.substring(1);
      } else if (cleaned.length === 10) {
        cleaned = "+234" + cleaned;
      } else {
        cleaned = "+" + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if SMS service is configured
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Get SMS provider info (for debugging)
   */
  getProviderInfo(): {
    configured: boolean;
    provider: string;
    fromNumber?: string;
  } {
    return {
      configured: this.isConfigured,
      provider: "Twilio",
      fromNumber: twilioPhoneNumber,
    };
  }

  /**
   * Calculate SMS segments (for cost estimation)
   */
  calculateSmsSegments(message: string): {
    segments: number;
    charactersPerSegment: number;
    totalCharacters: number;
  } {
    const length = message.length;
    let charactersPerSegment: number;
    let segments: number;

    // Check if message contains unicode characters
    const hasUnicode = /[^\x00-\x7F]/.test(message);

    if (hasUnicode) {
      // Unicode messages (70 chars per segment)
      charactersPerSegment = 70;
      segments = Math.ceil(length / 67); // 67 for concatenated messages
    } else {
      // GSM-7 messages (160 chars per segment)
      charactersPerSegment = 160;
      segments = Math.ceil(length / 153); // 153 for concatenated messages
    }

    return {
      segments: segments || 1,
      charactersPerSegment,
      totalCharacters: length,
    };
  }
}

export default new SmsService();
