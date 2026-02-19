import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import { EmailJobData } from "../queues/emailQueue";
import emailService from "../services/EmailService";
import templateService from "../services/TemplateService";
import { NotificationDeliveryLog } from "../models/NotificationDeliveryLog";
import { Notification } from "../models/Notification";
import { DeliveryStatus } from "../@types/deliveryLog.types";
import { TemplateType } from "../@types/template.types";
import logger from "../utils/logger";

class EmailWorker {
  private worker: Worker<EmailJobData>;

  constructor() {
    this.worker = new Worker<EmailJobData>(
      "email-notifications",
      async (job: Job<EmailJobData>) => {
        return await this.processEmailJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 5, // Process 5 emails concurrently
        limiter: {
          max: 100, // Maximum 100 emails
          duration: 60000, // Per minute (rate limiting)
        },
      },
    );

    this.setupEventHandlers();
    logger.info(" Email worker started");
  }

  /**
   * Process email job
   */
  private async processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const {
      deliveryLogId,
      notificationId,
      recipientEmail,
      templateType,
      templateData,
      language,
      subject,
      body,
    } = job.data;

    logger.info(`Processing email job: ${job.id}`);

    try {
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

      let emailSubject: string;
      let emailBody: string;

      // If template is provided, render it
      if (templateType && templateData) {
        const rendered = await templateService.renderEmail(
          templateType as TemplateType,
          templateData,
          language || "en",
        );

        if (!rendered) {
          throw new Error("Failed to render email template");
        }

        emailSubject = rendered.subject;
        emailBody = rendered.body;
      } else if (subject && body) {
        // Use provided subject and body
        emailSubject = subject;
        emailBody = body;
      } else {
        // Fallback to notification title and body
        emailSubject = notification.title;
        emailBody = `
          <!DOCTYPE html>
          <html>
            <body>
              <h2>${notification.title}</h2>
              <p>${notification.body}</p>
            </body>
          </html>
        `;
      }

      // Determine recipient email
      const toEmail =
        recipientEmail ||
        (await this.getRecipientEmail(notification.recipientId));
      if (!toEmail) {
        throw new Error("Recipient email not found");
      }

      // Send email
      const result = await emailService.sendEmail({
        to: toEmail,
        subject: emailSubject,
        html: emailBody,
      });

      if (!result.success) {
        throw new Error(result.error || "Email send failed");
      }

      // Update delivery log - mark as sent
      await deliveryLog.markSent(result.messageId);

      logger.info(
        `Email sent successfully: job=${job.id}, to=${toEmail}, messageId=${result.messageId}`,
      );

      // Update job progress
      await job.updateProgress(100);
    } catch (error: any) {
      logger.error(`Email job failed: job=${job.id}`, error);

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
   * Get recipient email from user service (placeholder)
   */
  private async getRecipientEmail(recipientId: string): Promise<string | null> {
    // TODO: Call user service API to get email
    // For now, return null
    logger.warn(`Recipient email lookup not implemented for: ${recipientId}`);
    return null;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.worker.on("completed", (job) => {
      logger.info(`Email job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, error) => {
      if (job) {
        logger.error(
          `Email job failed: ${job.id}, attempts: ${job.attemptsMade}/${job.opts.attempts}`,
          error,
        );
      }
    });

    this.worker.on("error", (error) => {
      logger.error("Email worker error:", error);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`Email job stalled: ${jobId}`);
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down email worker...");
    await this.worker.close();
    logger.info("Email worker shut down");
  }
}

export default new EmailWorker();
