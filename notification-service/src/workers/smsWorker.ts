import { Worker, Job } from "bullmq";
import { SmsJobData } from "../queues/smsQueue";
import smsService from "../services/SmsService";
import templateService from "../services/TemplateService";
import { NotificationDeliveryLog } from "../models/NotificationDeliveryLog";
import { Notification } from "../models/Notification";
import { DeliveryStatus } from "../@types/deliveryLog.types";
import { TemplateType } from "../@types/template.types";
import logger from "../utils/logger";

class SmsWorker {
  private worker: Worker<SmsJobData>;

  constructor() {
    this.worker = new Worker<SmsJobData>(
      "sms-notifications",
      async (job: Job<SmsJobData>) => {
        return await this.processSmsJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || "0"),
        },
        concurrency: 3, // Process 3 SMS concurrently
        limiter: {
          max: 50, // Maximum 50 SMS
          duration: 60000, // Per minute (rate limiting)
        },
      },
    );

    this.setupEventHandlers();
    logger.info("SMS worker started");
  }

  /**
   * Process SMS job
   */
  private async processSmsJob(job: Job<SmsJobData>): Promise<void> {
    const {
      deliveryLogId,
      notificationId,
      recipientPhone,
      templateType,
      templateData,
      language,
      message,
    } = job.data;

    logger.info(`Processing SMS job: ${job.id}`);

    try {
      // Check if SMS service is available
      if (!smsService.isAvailable()) {
        logger.warn("SMS service not configured - skipping job");
        // Mark job as completed (don't retry if SMS is not configured)
        return;
      }

      // Update delivery log status to SENDING
      const deliveryLog = await NotificationDeliveryLog.findByPk(deliveryLogId);
      if (!deliveryLog) {
        throw new Error(`Delivery log not found: ${deliveryLogId}`);
      }

      deliveryLog.status = DeliveryStatus.SENDING;
      await deliveryLog.save();

      // Get notification
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      let smsMessage: string;

      // If template is provided, render it
      if (templateType && templateData) {
        const rendered = await templateService.renderSms(
          templateType as TemplateType,
          templateData,
          language || "en",
        );

        if (!rendered) {
          throw new Error("Failed to render SMS template");
        }

        smsMessage = rendered;
      } else if (message) {
        // Use provided message
        smsMessage = message;
      } else {
        // Fallback to notification body (truncate if too long)
        smsMessage = notification.body.substring(0, 160);
      }

      // Determine recipient phone
      const toPhone =
        recipientPhone ||
        (await this.getRecipientPhone(notification.recipientId));
      if (!toPhone) {
        throw new Error("Recipient phone number not found");
      }

      // Calculate SMS segments (for logging)
      const segments = smsService.calculateSmsSegments(smsMessage);
      logger.info(
        `SMS segments: ${segments.segments}, characters: ${segments.totalCharacters}`,
      );

      // Send SMS
      const result = await smsService.sendSms({
        to: toPhone,
        message: smsMessage,
      });

      if (!result.success) {
        throw new Error(result.error || "SMS send failed");
      }

      // Update delivery log - mark as sent
      await deliveryLog.markSent(result.messageId);

      logger.info(
        `SMS sent successfully: job=${job.id}, to=${toPhone}, messageId=${result.messageId}`,
      );

      // Update job progress
      await job.updateProgress(100);
    } catch (error: any) {
      logger.error(`SMS job failed: job=${job.id}`, error);

      // Update delivery log - mark as failed
      const deliveryLog = await NotificationDeliveryLog.findByPk(deliveryLogId);
      if (deliveryLog) {
        await deliveryLog.markFailed(error.message || "Unknown error");
      }

      // Re-throw error so Bull can handle retry
      throw error;
    }
  }

  /**
   * Get recipient phone from user service (placeholder)
   */
  private async getRecipientPhone(recipientId: string): Promise<string | null> {
    // TODO: Call user service API to get phone
    // For now, return null
    logger.warn(`Recipient phone lookup not implemented for: ${recipientId}`);
    return null;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.worker.on("completed", (job) => {
      logger.info(`SMS job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, error) => {
      if (job) {
        logger.error(
          `SMS job failed: ${job.id}, attempts: ${job.attemptsMade}/${job.opts.attempts}`,
          error,
        );
      }
    });

    this.worker.on("error", (error) => {
      logger.error("SMS worker error:", error);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`SMS job stalled: ${jobId}`);
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down SMS worker...");
    await this.worker.close();
    logger.info("SMS worker shut down");
  }
}

export default new SmsWorker();
