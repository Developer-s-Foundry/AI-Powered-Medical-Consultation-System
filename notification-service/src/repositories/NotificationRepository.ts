import { Notification } from "../models/Notification";
import {
  RecipientType,
  NotificationType,
  ReferenceType,
  NotificationAttributes,
} from "../@types/notification.types";

export class NotificationRepository {
  /**
   * Create notification
   */
  async create(data: Partial<NotificationAttributes>): Promise<Notification> {
    return Notification.createNotification(data);
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<Notification | null> {
    return Notification.findByPk(id);
  }

  /**
   * Find by ID with delivery logs
   */
  async findByIdWithLogs(id: string): Promise<Notification | null> {
    return Notification.findWithLogs(id);
  }

  /**
   * Find by recipient
   */
  async findByRecipient(
    recipientId: string,
    options?: {
      type?: NotificationType;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ rows: Notification[]; count: number }> {
    return Notification.findByRecipient(recipientId, options);
  }

  /**
   * Find by reference
   */
  async findByReference(
    referenceType: ReferenceType,
    referenceId: string,
  ): Promise<Notification[]> {
    return Notification.findByReference(referenceType, referenceId);
  }

  /**
   * Find recent notifications (24h)
   */
  async findRecent(recipientId: string): Promise<Notification[]> {
    return Notification.findRecent(recipientId);
  }

  /**
   * Count notifications
   */
  async countByRecipient(recipientId: string): Promise<number> {
    return Notification.countByRecipient(recipientId);
  }

  /**
   * Get statistics
   */
  async getStats(options?: {
    recipientId?: string;
    recipientType?: RecipientType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    return Notification.getStats(options);
  }

  /**
   * Cleanup old notifications
   */
  async cleanup(daysOld: number = 90): Promise<number> {
    return Notification.cleanup(daysOld);
  }

  /**
   * Bulk create
   */
  async bulkCreate(
    notifications: Partial<NotificationAttributes>[],
  ): Promise<Notification[]> {
    return Notification.bulkCreateNotifications(notifications);
  }
}

export default new NotificationRepository();
