import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  Index,
  IsUUID,
  PrimaryKey,
  Default,
  HasMany,
} from "sequelize-typescript";
import {
  RecipientType,
  NotificationType,
  ReferenceType,
  NotificationAttributes,
} from "../@types/notification.types";
import { NotificationDeliveryLog } from "./NotificationDeliveryLog";

@Table({
  tableName: "notifications",
  timestamps: true,
  underscored: true,
})
export class Notification extends Model<NotificationAttributes> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: "id",
  })
  id!: string;

  @Index
  @IsUUID(4)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: "recipient_id",
  })
  recipientId!: string;

  @Index
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(RecipientType)),
    field: "recipient_type",
  })
  recipientType!: RecipientType;

  @Index
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    field: "type",
  })
  type!: NotificationType;

  @Index
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(ReferenceType)),
    field: "reference_type",
  })
  referenceType!: ReferenceType;

  @Index
  @IsUUID(4)
  @Column({
    type: DataType.UUID,
    field: "reference_id",
  })
  referenceId?: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(500),
    field: "title",
  })
  title!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    field: "body",
  })
  body!: string;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    field: "created_at",
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updated_at",
  })
  updatedAt!: Date;

  // ==================== RELATIONSHIPS ====================

  @HasMany(() => NotificationDeliveryLog)
  deliveryLogs?: NotificationDeliveryLog[];

  // ==================== INSTANCE METHODS ====================

  /**
   * Get formatted notification for logging
   */
  toLogFormat(): string {
    return `Notification #${this.id.substring(0, 8)} [${this.type}] for ${this.recipientType} #${this.recipientId.substring(0, 8)} - ${this.title}`;
  }

  /**
   * Get short preview of body
   */
  getBodyPreview(maxLength: number = 100): string {
    if (this.body.length <= maxLength) {
      return this.body;
    }
    return this.body.substring(0, maxLength) + "...";
  }

  /**
   * Check if notification is recent (within 24 hours)
   */
  isRecent(): boolean {
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);
    return this.createdAt > dayAgo;
  }

  /**
   * Get reference information as string
   */
  getReferenceInfo(): string {
    if (!this.referenceId) {
      return "No reference";
    }
    return `${this.referenceType}:${this.referenceId.substring(0, 8)}`;
  }

  // ==================== STATIC METHODS ====================

  /**
   * Create notification
   */
  static async createNotification(
    data: Partial<NotificationAttributes>,
  ): Promise<Notification> {
    return this.create(data as any);
  }

  /**
   * Find notifications by recipient
   */
  static async findByRecipient(
    recipientId: string,
    options?: {
      type?: NotificationType;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ rows: Notification[]; count: number }> {
    const where: any = { recipientId };

    if (options?.type) {
      where.type = options.type;
    }

    return this.findAndCountAll({
      where,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
      order: [["created_at", "DESC"]],
      include: [{ model: NotificationDeliveryLog }],
    });
  }

  /**
   * Find notifications by reference
   */
  static async findByReference(
    referenceType: ReferenceType,
    referenceId: string,
  ): Promise<Notification[]> {
    return this.findAll({
      where: {
        referenceType,
        referenceId,
      },
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Find notifications by type
   */
  static async findByType(
    type: NotificationType,
    limit: number = 100,
  ): Promise<Notification[]> {
    return this.findAll({
      where: { type },
      limit,
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Find recent notifications (last 24 hours)
   */
  static async findRecent(recipientId: string): Promise<Notification[]> {
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);

    return this.findAll({
      where: {
        recipientId,
        createdAt: {
          [Op.gte]: dayAgo,
        },
      },
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Get notification with delivery logs
   */
  static async findWithLogs(
    notificationId: string,
  ): Promise<Notification | null> {
    return this.findByPk(notificationId, {
      include: [
        {
          model: NotificationDeliveryLog,
          order: [["attempted_at", "DESC"]],
        },
      ],
    });
  }

  /**
   * Get delivery success rate for notification
   */
  async getDeliverySuccessRate(): Promise<number> {
    if (!this.deliveryLogs || this.deliveryLogs.length === 0) {
      return 0;
    }

    const successful = this.deliveryLogs.filter((log) =>
      log.isSuccessful(),
    ).length;
    return (successful / this.deliveryLogs.length) * 100;
  }

  /**
   * Count notifications by recipient
   */
  static async countByRecipient(recipientId: string): Promise<number> {
    return this.count({ where: { recipientId } });
  }

  /**
   * Get notification statistics
   */
  static async getStats(options?: {
    recipientId?: string;
    recipientType?: RecipientType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    byType: Record<NotificationType, number>;
    byRecipientType: Record<RecipientType, number>;
    byReferenceType: Record<ReferenceType, number>;
    recent24h: number;
  }> {
    const where: any = {};

    if (options?.recipientId) {
      where.recipientId = options.recipientId;
    }

    if (options?.recipientType) {
      where.recipientType = options.recipientType;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt[Op.gte] = options.startDate;
      }
      if (options.endDate) {
        where.createdAt[Op.lte] = options.endDate;
      }
    }

    const total = await this.count({ where });

    // Count by type
    const byTypeResults = (await this.findAll({
      where,
      attributes: ["type", [fn("COUNT", col("id")), "count"]],
      group: ["type"],
      raw: true,
    })) as any[];

    const byType: Record<NotificationType, number> = {} as any;
    byTypeResults.forEach((result: any) => {
      byType[result.type as NotificationType] = parseInt(result.count);
    });

    // Count by recipient type
    const byRecipientTypeResults = (await this.findAll({
      where,
      attributes: ["recipient_type", [fn("COUNT", col("id")), "count"]],
      group: ["recipient_type"],
      raw: true,
    })) as any[];

    const byRecipientType: Record<RecipientType, number> = {} as any;
    byRecipientTypeResults.forEach((result: any) => {
      byRecipientType[result.recipient_type as RecipientType] = parseInt(
        result.count,
      );
    });

    // Count by reference type
    const byReferenceTypeResults = (await this.findAll({
      where,
      attributes: ["reference_type", [fn("COUNT", col("id")), "count"]],
      group: ["reference_type"],
      raw: true,
    })) as any[];

    const byReferenceType: Record<ReferenceType, number> = {} as any;
    byReferenceTypeResults.forEach((result: any) => {
      byReferenceType[result.reference_type as ReferenceType] = parseInt(
        result.count,
      );
    });

    // Count recent (24h)
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);
    const recent24h = await this.count({
      where: {
        ...where,
        createdAt: {
          [Op.gte]: dayAgo,
        },
      },
    });

    return {
      total,
      byType,
      byRecipientType,
      byReferenceType,
      recent24h,
    };
  }

  /**
   * Clean up old notifications
   */
  static async cleanup(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleted = await this.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return deleted;
  }

  /**
   * Bulk create notifications
   */
  static async bulkCreateNotifications(
    notifications: Partial<NotificationAttributes>[],
  ): Promise<Notification[]> {
    return this.bulkCreate(notifications as any);
  }
}

// Import Op for queries
import { Op, fn, col } from "sequelize";
