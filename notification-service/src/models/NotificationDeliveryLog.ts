import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
  Index,
  IsUUID,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Notification } from "./Notification";
import {
  DeliveryStatus,
  DeliveryProvider,
  DeliveryLogAttributes,
} from "../@types/deliveryLog.types";

@Table({
  tableName: "notification_delivery_logs",
  timestamps: false, // We're managing timestamps manually
  underscored: true,
})
export class NotificationDeliveryLog extends Model<DeliveryLogAttributes> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: "id",
  })
  id!: string;

  @ForeignKey(() => Notification)
  @Index
  @IsUUID(4)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: "notification_id",
  })
  notificationId!: string;

  @BelongsTo(() => Notification)
  notification?: Notification;

  @Index
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(DeliveryStatus)),
    field: "status",
  })
  status!: DeliveryStatus;

  @Index
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(DeliveryProvider)),
    field: "provider",
  })
  provider!: DeliveryProvider;

  @Index
  @Column({
    type: DataType.STRING(255),
    field: "provider_message_id",
  })
  providerMessageId?: string;

  @Column({
    type: DataType.TEXT,
    field: "error_message",
  })
  errorMessage?: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: "retry_count",
  })
  retryCount!: number;

  @Index
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: "attempted_at",
  })
  attemptedAt!: Date;

  @Index
  @Column({
    type: DataType.DATE,
    field: "delivered_at",
  })
  deliveredAt?: Date;

  // ==================== INSTANCE METHODS ====================

  /**
   * Mark as sent
   */
  async markSent(providerMessageId?: string): Promise<void> {
    this.status = DeliveryStatus.SENT;
    this.providerMessageId = providerMessageId;
    await this.save();
  }

  /**
   * Mark as delivered
   */
  async markDelivered(): Promise<void> {
    this.status = DeliveryStatus.DELIVERED;
    this.deliveredAt = new Date();
    await this.save();
  }

  /**
   * Mark as failed
   */
  async markFailed(errorMessage: string): Promise<void> {
    this.status = DeliveryStatus.FAILED;
    this.errorMessage = errorMessage;
    this.retryCount += 1;
    await this.save();
  }

  /**
   * Mark as bounced
   */
  async markBounced(reason: string): Promise<void> {
    this.status = DeliveryStatus.BOUNCED;
    this.errorMessage = reason;
    await this.save();
  }

  /**
   * Mark as rejected
   */
  async markRejected(reason: string): Promise<void> {
    this.status = DeliveryStatus.REJECTED;
    this.errorMessage = reason;
    await this.save();
  }

  /**
   * Get delivery duration in milliseconds
   */
  getDeliveryDuration(): number | null {
    if (this.attemptedAt && this.deliveredAt) {
      return this.deliveredAt.getTime() - this.attemptedAt.getTime();
    }
    return null;
  }

  /**
   * Check if delivery was successful
   */
  isSuccessful(): boolean {
    return (
      this.status === DeliveryStatus.SENT ||
      this.status === DeliveryStatus.DELIVERED
    );
  }

  /**
   * Check if should retry
   */
  canRetry(maxRetries: number = 3): boolean {
    return (
      this.retryCount < maxRetries && this.status === DeliveryStatus.FAILED
    );
  }

  /**
   * Get time since attempt in minutes
   */
  getTimeSinceAttempt(): number {
    const now = new Date();
    return Math.floor(
      (now.getTime() - this.attemptedAt.getTime()) / (1000 * 60),
    );
  }

  /**
   * Get formatted log entry
   */
  toLogFormat(): string {
    return `DeliveryLog #${this.id.substring(0, 8)} | Notification: ${this.notificationId.substring(0, 8)} | Provider: ${this.provider} | Status: ${this.status} | Retries: ${this.retryCount}`;
  }

  // ==================== STATIC METHODS ====================

  /**
   * Create delivery log
   */
  static async createLog(
    data: Partial<DeliveryLogAttributes>,
  ): Promise<NotificationDeliveryLog> {
    // Set attempted_at to now if not provided
    if (!data.attemptedAt) {
      data.attemptedAt = new Date();
    }

    // Set default retry_count if not provided
    if (data.retryCount === undefined) {
      data.retryCount = 0;
    }

    return this.create(data as any);
  }

  /**
   * Find logs by notification ID
   */
  static async findByNotificationId(
    notificationId: string,
  ): Promise<NotificationDeliveryLog[]> {
    return this.findAll({
      where: { notificationId },
      order: [["attempted_at", "ASC"]],
    });
  }

  /**
   * Find latest log for notification
   */
  static async findLatestByNotificationId(
    notificationId: string,
  ): Promise<NotificationDeliveryLog | null> {
    return this.findOne({
      where: { notificationId },
      order: [["attempted_at", "DESC"]],
    });
  }

  /**
   * Find failed deliveries that can be retried
   */
  static async findRetriable(
    maxRetries: number = 3,
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return this.findAll({
      where: {
        status: DeliveryStatus.FAILED,
        retryCount: {
          [Op.lt]: maxRetries,
        },
      },
      limit,
      order: [["attempted_at", "ASC"]],
    });
  }

  /**
   * Find pending deliveries
   */
  static async findPending(
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return this.findAll({
      where: {
        status: DeliveryStatus.PENDING,
      },
      limit,
      order: [["attempted_at", "ASC"]],
    });
  }

  /**
   * Find logs by status
   */
  static async findByStatus(
    status: DeliveryStatus,
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return this.findAll({
      where: { status },
      limit,
      order: [["attempted_at", "DESC"]],
      include: [{ model: Notification }],
    });
  }

  /**
   * Find logs by provider
   */
  static async findByProvider(
    provider: DeliveryProvider,
    limit: number = 100,
  ): Promise<NotificationDeliveryLog[]> {
    return this.findAll({
      where: { provider },
      limit,
      order: [["attempted_at", "DESC"]],
    });
  }

  /**
   * Get delivery statistics
   */
  static async getStats(options?: {
    provider?: DeliveryProvider;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    pending: number;
    sent: number;
    delivered: number;
    failed: number;
    bounced: number;
    rejected: number;
    successRate: number;
    averageRetries: number;
    averageDeliveryTime: number | null;
    byProvider: Record<DeliveryProvider, number>;
  }> {
    const where: any = {};

    if (options?.provider) {
      where.provider = options.provider;
    }

    if (options?.startDate || options?.endDate) {
      where.attemptedAt = {};
      if (options.startDate) {
        where.attemptedAt[Op.gte] = options.startDate;
      }
      if (options.endDate) {
        where.attemptedAt[Op.lte] = options.endDate;
      }
    }

    const [total, pending, sent, delivered, failed, bounced, rejected] =
      await Promise.all([
        this.count({ where }),
        this.count({ where: { ...where, status: DeliveryStatus.PENDING } }),
        this.count({ where: { ...where, status: DeliveryStatus.SENT } }),
        this.count({ where: { ...where, status: DeliveryStatus.DELIVERED } }),
        this.count({ where: { ...where, status: DeliveryStatus.FAILED } }),
        this.count({ where: { ...where, status: DeliveryStatus.BOUNCED } }),
        this.count({ where: { ...where, status: DeliveryStatus.REJECTED } }),
      ]);

    const successRate = total > 0 ? ((sent + delivered) / total) * 100 : 0;

    // Calculate average retries
    const retriesResult = (await this.findAll({
      where,
      attributes: [[fn("AVG", col("retry_count")), "avgRetries"]],
      raw: true,
    })) as any[];
    const averageRetries = retriesResult[0]?.avgRetries
      ? parseFloat(retriesResult[0].avgRetries)
      : 0;

    // Calculate average delivery time
    const deliveredLogs = await this.findAll({
      where: {
        ...where,
        status: DeliveryStatus.DELIVERED,
        deliveredAt: { [Op.ne]: null },
      },
      attributes: ["attempted_at", "delivered_at"],
    });

    let averageDeliveryTime: number | null = null;
    if (deliveredLogs.length > 0) {
      const totalDuration = deliveredLogs.reduce((sum, log) => {
        const duration = log.getDeliveryDuration();
        return sum + (duration || 0);
      }, 0);
      averageDeliveryTime = totalDuration / deliveredLogs.length;
    }

    // Count by provider
    const byProviderResults = (await this.findAll({
      where,
      attributes: ["provider", [fn("COUNT", col("id")), "count"]],
      group: ["provider"],
      raw: true,
    })) as any[];

    const byProvider: Record<DeliveryProvider, number> = {} as any;
    byProviderResults.forEach((result: any) => {
      byProvider[result.provider as DeliveryProvider] = parseInt(result.count);
    });

    return {
      total,
      pending,
      sent,
      delivered,
      failed,
      bounced,
      rejected,
      successRate: parseFloat(successRate.toFixed(2)),
      averageRetries: parseFloat(averageRetries.toFixed(2)),
      averageDeliveryTime,
      byProvider,
    };
  }

  /**
   * Clean up old logs
   */
  static async cleanup(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleted = await this.destroy({
      where: {
        attemptedAt: {
          [Op.lt]: cutoffDate,
        },
        status: {
          [Op.in]: [DeliveryStatus.SENT, DeliveryStatus.DELIVERED],
        },
      },
    });

    return deleted;
  }

  /**
   * Get failed deliveries grouped by error
   */
  static async getFailureAnalysis(limit: number = 10): Promise<
    Array<{
      errorMessage: string;
      count: number;
      latestOccurrence: Date;
    }>
  > {
    const results = (await this.findAll({
      where: {
        status: DeliveryStatus.FAILED,
        errorMessage: { [Op.ne]: "" },
      },
      attributes: [
        "error_message",
        [fn("COUNT", col("id")), "count"],
        [fn("MAX", col("attempted_at")), "latest"],
      ],
      group: ["error_message"],
      order: [[fn("COUNT", col("id")), "DESC"]],
      limit,
      raw: true,
    })) as any[];

    return results.map((r) => ({
      errorMessage: r.error_message,
      count: parseInt(r.count),
      latestOccurrence: new Date(r.latest),
    }));
  }
}

// Import Op for queries
import { Op, fn, col } from "sequelize";
