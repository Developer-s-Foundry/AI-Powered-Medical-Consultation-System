import { NotificationDeliveryLog } from "../models/NotificationDeliveryLog";
import {
  DeliveryStatus,
  DeliveryProvider,
  DeliveryLogAttributes,
} from "../@types/deliveryLog.types";

export class DeliveryLogRepository {
  /**
   * Create delivery log
   */
  async create(
    data: Partial<DeliveryLogAttributes>,
  ): Promise<NotificationDeliveryLog> {
    return NotificationDeliveryLog.createLog(data);
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<NotificationDeliveryLog | null> {
    return NotificationDeliveryLog.findByPk(id);
  }

  /**
   * Find logs by notification ID
   */
  async findByNotificationId(
    notificationId: string,
  ): Promise<NotificationDeliveryLog[]> {
    return NotificationDeliveryLog.findByNotificationId(notificationId);
  }

  /**
   * Find latest log for notification
   */
  async findLatestByNotificationId(
    notificationId: string,
  ): Promise<NotificationDeliveryLog | null> {
    return NotificationDeliveryLog.findLatestByNotificationId(notificationId);
  }

  /**
   * Find pending deliveries
   */
  async findPending(limit: number = 100): Promise<NotificationDeliveryLog[]> {
    return NotificationDeliveryLog.findPending(limit);
  }

  /**
   * Find retriable failed deliveries
   */
  async findRetriable(
    maxRetries: number = 3,
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return NotificationDeliveryLog.findRetriable(maxRetries, limit);
  }

  /**
   * Find logs by status
   */
  async findByStatus(
    status: DeliveryStatus,
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return NotificationDeliveryLog.findByStatus(status, limit);
  }

  /**
   * Find logs by provider
   */
  async findByProvider(
    provider: DeliveryProvider,
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return NotificationDeliveryLog.findByProvider(provider, limit);
  }

  /**
   * Mark as sent
   */
  async markSent(id: string, providerMessageId?: string): Promise<void> {
    const log = await this.findById(id);
    if (log) {
      await log.markSent(providerMessageId);
    }
  }

  /**
   * Mark as delivered
   */
  async markDelivered(id: string): Promise<void> {
    const log = await this.findById(id);
    if (log) {
      await log.markDelivered();
    }
  }

  /**
   * Mark as failed
   */
  async markFailed(id: string, errorMessage: string): Promise<void> {
    const log = await this.findById(id);
    if (log) {
      await log.markFailed(errorMessage);
    }
  }

  /**
   * Get statistics
   */
  async getStats(options?: {
    provider?: DeliveryProvider;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    return NotificationDeliveryLog.getStats(options);
  }

  /**
   * Get failure analysis
   */
  async getFailureAnalysis(limit: number = 10): Promise<any> {
    return NotificationDeliveryLog.getFailureAnalysis(limit);
  }

  /**
   * Cleanup old logs
   */
  async cleanup(daysOld: number = 90): Promise<number> {
    return NotificationDeliveryLog.cleanup(daysOld);
  }
}

export default new DeliveryLogRepository();
