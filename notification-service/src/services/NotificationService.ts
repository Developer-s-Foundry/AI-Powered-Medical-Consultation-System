import { Notification } from "../models/Notification";
import { NotificationDeliveryLog } from "../models/NotificationDeliveryLog";
import {
  RecipientType,
  NotificationType,
  ReferenceType,
} from "../@types/notification.types";
import { DeliveryStatus, DeliveryProvider } from "../@types/deliveryLog.types";
import { TemplateType } from "../@types/template.types";
import templateService from "./TemplateService";
import emailQueue from "../queues/emailQueue";
import smsQueue from "../queues/smsQueue";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

const EMAIL_JOB_NAME = "send-email" as const;
const SMS_JOB_NAME = "send-sms" as const;

export interface CreateNotificationInput {
  recipientId: string;
  recipientType: RecipientType;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  referenceType: ReferenceType;
  referenceId?: string;
  templateType?: TemplateType;
  templateData?: Record<string, any>;
  title?: string;
  body?: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  language?: string;
}

export class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification(
    input: CreateNotificationInput,
  ): Promise<Notification> {
    try {
      let title = input.title;
      let body = input.body;

      // If template is specified, render it
      if (input.templateType && input.templateData) {
        const rendered = await templateService.render(
          input.templateType,
          input.templateData,
          input.language || "en",
        );

        if (!rendered) {
          throw new Error("Failed to render template");
        }

        // Use rendered title and body if not explicitly provided
        if (!title && rendered.title) {
          title = rendered.title;
        }
        if (!body && rendered.body) {
          body = rendered.body;
        }
      }

      // Validate title and body
      if (!title || !body) {
        throw new Error("Title and body are required");
      }

      // Create notification record
      const notification = await Notification.create({
        id: uuidv4(),
        recipientId: input.recipientId,
        recipientType: input.recipientType,
        type: input.type,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        title,
        body,
      });

      logger.info(
        `Notification created: id=${notification.id}, type=${notification.type}`,
      );

      // Queue email delivery if requested
      if (input.sendEmail && input.recipientEmail) {
        await this.queueEmailDelivery(
          notification,
          input.recipientEmail,
          input.templateType,
          input.templateData,
          input.language,
        );
      }

      // Queue SMS delivery if requested
      if (input.sendSms && input.recipientPhone) {
        await this.queueSmsDelivery(
          notification,
          input.recipientPhone,
          input.templateType,
          input.templateData,
          input.language,
        );
      }

      return notification;
    } catch (error) {
      logger.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Queue email delivery
   */
  private async queueEmailDelivery(
    notification: Notification,
    recipientEmail: string,
    templateType?: TemplateType,
    templateData?: Record<string, any>,
    language?: string,
  ): Promise<void> {
    try {
      // Create delivery log
      const deliveryLog = await NotificationDeliveryLog.create({
        id: uuidv4(),
        notificationId: notification.id,
        status: DeliveryStatus.PENDING,
        provider: DeliveryProvider.NODEMAILER,
        retryCount: 0,
        attemptedAt: new Date(),
      });

      // Add to email queue
      await emailQueue.add(EMAIL_JOB_NAME, {
        deliveryLogId: deliveryLog.id,
        notificationId: notification.id,
        recipientEmail,
        templateType,
        templateData,
        language: language || "en",
      });

      logger.info(
        `Email delivery queued: notification=${notification.id}, log=${deliveryLog.id}`,
      );
    } catch (error) {
      logger.error("Error queuing email delivery:", error);
      throw error;
    }
  }

  /**
   * Queue SMS delivery
   */
  private async queueSmsDelivery(
    notification: Notification,
    recipientPhone: string,
    templateType?: TemplateType,
    templateData?: Record<string, any>,
    language?: string,
  ): Promise<void> {
    try {
      // Create delivery log
      const deliveryLog = await NotificationDeliveryLog.create({
        id: uuidv4(),
        notificationId: notification.id,
        status: DeliveryStatus.PENDING,
        provider: DeliveryProvider.TWILIO,
        retryCount: 0,
        attemptedAt: new Date(),
      });

      // Add to SMS queue
      await smsQueue.add(SMS_JOB_NAME, {
        deliveryLogId: deliveryLog.id,
        notificationId: notification.id,
        recipientPhone,
        templateType,
        templateData,
        language: language || "en",
      });

      logger.info(
        `SMS delivery queued: notification=${notification.id}, log=${deliveryLog.id}`,
      );
    } catch (error) {
      logger.error("Error queuing SMS delivery:", error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotification(id: string): Promise<Notification | null> {
    try {
      return await Notification.findByPk(id);
    } catch (error) {
      logger.error("Error fetching notification:", error);
      throw error;
    }
  }

  /**
   * Get notification with delivery logs
   */
  async getNotificationWithLogs(id: string): Promise<Notification | null> {
    try {
      return await Notification.findWithLogs(id);
    } catch (error) {
      logger.error("Error fetching notification with logs:", error);
      throw error;
    }
  }

  /**
   * Get notifications for recipient
   */
  async getRecipientNotifications(
    recipientId: string,
    options?: {
      type?: NotificationType;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ rows: Notification[]; count: number }> {
    try {
      return await Notification.findByRecipient(recipientId, options);
    } catch (error) {
      logger.error("Error fetching recipient notifications:", error);
      throw error;
    }
  }

  /**
   * Get recent notifications for recipient
   */
  async getRecentNotifications(recipientId: string): Promise<Notification[]> {
    try {
      return await Notification.findRecent(recipientId);
    } catch (error) {
      logger.error("Error fetching recent notifications:", error);
      throw error;
    }
  }

  /**
   * Get notifications by reference
   */
  async getNotificationsByReference(
    referenceType: ReferenceType,
    referenceId: string,
  ): Promise<Notification[]> {
    try {
      return await Notification.findByReference(referenceType, referenceId);
    } catch (error) {
      logger.error("Error fetching notifications by reference:", error);
      throw error;
    }
  }

  /**
   * Count recipient notifications
   */
  async countRecipientNotifications(recipientId: string): Promise<number> {
    try {
      return await Notification.countByRecipient(recipientId);
    } catch (error) {
      logger.error("Error counting notifications:", error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(options?: {
    recipientId?: string;
    recipientType?: RecipientType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      return await Notification.getStats(options);
    } catch (error) {
      logger.error("Error fetching notification stats:", error);
      throw error;
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(options?: {
    provider?: DeliveryProvider;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      return await NotificationDeliveryLog.getStats(options);
    } catch (error) {
      logger.error("Error fetching delivery stats:", error);
      throw error;
    }
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryLogId: string): Promise<void> {
    try {
      const deliveryLog = await NotificationDeliveryLog.findByPk(deliveryLogId);

      if (!deliveryLog) {
        throw new Error("Delivery log not found");
      }

      if (!deliveryLog.canRetry(3)) {
        throw new Error("Maximum retry attempts reached");
      }

      const notification = await this.getNotification(
        deliveryLog.notificationId,
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      // Create new delivery log for retry
      const retryLog = await NotificationDeliveryLog.create({
        id: uuidv4(),
        notificationId: notification.id,
        status: DeliveryStatus.PENDING,
        provider: deliveryLog.provider,
        retryCount: deliveryLog.retryCount + 1,
        attemptedAt: new Date(),
      });

      // Re-queue based on provider
      if (deliveryLog.provider === DeliveryProvider.TWILIO) {
        await smsQueue.add(SMS_JOB_NAME, {
          deliveryLogId: retryLog.id,
          notificationId: notification.id,
        });
      } else {
        await emailQueue.add(EMAIL_JOB_NAME, {
          deliveryLogId: retryLog.id,
          notificationId: notification.id,
        });
      }

      logger.info(
        `Delivery retry queued: original=${deliveryLogId}, retry=${retryLog.id}`,
      );
    } catch (error) {
      logger.error("Error retrying delivery:", error);
      throw error;
    }
  }

  /**
   * Bulk create notifications
   */
  async bulkCreateNotifications(
    inputs: CreateNotificationInput[],
  ): Promise<Notification[]> {
    try {
      const notifications: Notification[] = [];

      for (const input of inputs) {
        const notification = await this.createNotification(input);
        notifications.push(notification);
      }

      logger.info(`Bulk notifications created: count=${notifications.length}`);
      return notifications;
    } catch (error) {
      logger.error("Error bulk creating notifications:", error);
      throw error;
    }
  }

  /**
   * Cleanup old notifications
   */
  async cleanup(
    daysOld: number = 90,
  ): Promise<{ notifications: number; logs: number }> {
    try {
      const [notifications, logs] = await Promise.all([
        Notification.cleanup(daysOld),
        NotificationDeliveryLog.cleanup(daysOld),
      ]);

      logger.info(
        `Cleanup completed: notifications=${notifications}, logs=${logs}`,
      );
      return { notifications, logs };
    } catch (error) {
      logger.error("Error during cleanup:", error);
      throw error;
    }
  }
}

export default new NotificationService();
