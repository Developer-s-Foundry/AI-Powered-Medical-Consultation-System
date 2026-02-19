import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  Default,
  AllowNull,
  Index,
  IsUUID,
  PrimaryKey,
  Unique,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import Handlebars from "handlebars";
import {
  TemplateType,
  NotificationTemplateAttributes,
  TemplateVariable,
  TemplateRenderData,
} from "../@types/template.types";

@Table({
  tableName: "notification_templates",
  timestamps: true,
  underscored: true,
})
export class NotificationTemplate extends Model<NotificationTemplateAttributes> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: "id",
  })
  id!: string;

  @Unique
  @Index
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(TemplateType)),
    field: "type",
  })
  type!: TemplateType;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    field: "name",
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    field: "description",
  })
  description?: string;

  // ==================== TEMPLATE CONTENT ====================

  @Column({
    type: DataType.STRING(500),
    field: "title_template",
  })
  titleTemplate?: string;

  @Column({
    type: DataType.TEXT,
    field: "body_template",
  })
  bodyTemplate?: string;

  @Column({
    type: DataType.STRING(500),
    field: "email_subject_template",
  })
  emailSubjectTemplate?: string;

  @Column({
    type: DataType.TEXT,
    field: "email_body_template",
  })
  emailBodyTemplate?: string;

  @Column({
    type: DataType.TEXT,
    field: "sms_template",
  })
  smsTemplate?: string;

  // ==================== VARIABLES ====================

  @Column({
    type: DataType.JSONB,
    field: "variables",
  })
  variables?: TemplateVariable[];

  // ==================== METADATA ====================

  @Index
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: "is_active",
  })
  isActive!: boolean;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    field: "version",
  })
  version!: number;

  @Default("en")
  @Index
  @Column({
    type: DataType.STRING(10),
    field: "language",
  })
  language!: string;

  // ==================== TIMESTAMPS ====================

  @CreatedAt
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

  // ==================== INSTANCE METHODS ====================

  /**
   * Render title with data
   */
  renderTitle(data: TemplateRenderData): string | null {
    if (!this.titleTemplate) return null;

    try {
      const template = Handlebars.compile(this.titleTemplate);
      return template(data);
    } catch (error) {
      throw new Error(`Failed to render title: ${error}`);
    }
  }

  /**
   * Render body with data
   */
  renderBody(data: TemplateRenderData): string | null {
    if (!this.bodyTemplate) return null;

    try {
      const template = Handlebars.compile(this.bodyTemplate);
      return template(data);
    } catch (error) {
      throw new Error(`Failed to render body: ${error}`);
    }
  }

  /**
   * Render email subject with data
   */
  renderEmailSubject(data: TemplateRenderData): string | null {
    if (!this.emailSubjectTemplate) return null;

    try {
      const template = Handlebars.compile(this.emailSubjectTemplate);
      return template(data);
    } catch (error) {
      throw new Error(`Failed to render email subject: ${error}`);
    }
  }

  /**
   * Render email body with data
   */
  renderEmailBody(data: TemplateRenderData): string | null {
    if (!this.emailBodyTemplate) return null;

    try {
      const template = Handlebars.compile(this.emailBodyTemplate);
      return template(data);
    } catch (error) {
      throw new Error(`Failed to render email body: ${error}`);
    }
  }

  /**
   * Render SMS with data
   */
  renderSms(data: TemplateRenderData): string | null {
    if (!this.smsTemplate) return null;

    try {
      const template = Handlebars.compile(this.smsTemplate);
      return template(data);
    } catch (error) {
      throw new Error(`Failed to render SMS: ${error}`);
    }
  }

  /**
   * Render all templates at once
   */
  renderAll(data: TemplateRenderData): {
    title: string | null;
    body: string | null;
    emailSubject: string | null;
    emailBody: string | null;
    sms: string | null;
  } {
    return {
      title: this.renderTitle(data),
      body: this.renderBody(data),
      emailSubject: this.renderEmailSubject(data),
      emailBody: this.renderEmailBody(data),
      sms: this.renderSms(data),
    };
  }

  /**
   * Validate required variables
   */
  validateData(data: TemplateRenderData): {
    valid: boolean;
    missing: string[];
  } {
    if (!this.variables) {
      return { valid: true, missing: [] };
    }

    const missing: string[] = [];

    this.variables.forEach((variable) => {
      if (variable.required && !(variable.name in data)) {
        missing.push(variable.name);
      }
    });

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Get variable list as readable string
   */
  getVariableList(): string {
    if (!this.variables || this.variables.length === 0) {
      return "No variables";
    }

    return this.variables
      .map((v) => `{{${v.name}}}${v.required ? " (required)" : ""}`)
      .join(", ");
  }

  /**
   * Create a new version of this template
   */
  async createVersion(
    updates: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate> {
    const newTemplate = await NotificationTemplate.create({
      ...this.toJSON(),
      id: uuidv4(),
      version: this.version + 1,
      ...updates,
    });

    // Deactivate old version
    this.isActive = false;
    await this.save();

    return newTemplate;
  }

  // ==================== STATIC METHODS ====================

  /**
   * Find active template by type
   */
  static async findByType(
    type: TemplateType,
    language: string = "en",
  ): Promise<NotificationTemplate | null> {
    return this.findOne({
      where: {
        type,
        language,
        isActive: true,
      },
      order: [["version", "DESC"]],
    });
  }

  /**
   * Find all active templates
   */
  static async findAllActive(
    language: string = "en",
  ): Promise<NotificationTemplate[]> {
    return this.findAll({
      where: {
        isActive: true,
        language,
      },
      order: [["type", "ASC"]],
    });
  }

  /**
   * Find all versions of a template
   */
  static async findVersions(
    type: TemplateType,
    language: string = "en",
  ): Promise<NotificationTemplate[]> {
    return this.findAll({
      where: {
        type,
        language,
      },
      order: [["version", "DESC"]],
    });
  }

  /**
   * Deactivate a template
   */
  static async deactivate(id: string): Promise<void> {
    await this.update({ isActive: false }, { where: { id } });
  }

  /**
   * Activate a template (and deactivate others of same type)
   */
  static async activate(id: string): Promise<void> {
    const template = await this.findByPk(id);
    if (!template) {
      throw new Error("Template not found");
    }

    // Deactivate all other templates of same type and language
    await this.update(
      { isActive: false },
      {
        where: {
          type: template.type,
          language: template.language,
        },
      },
    );

    // Activate this template
    template.isActive = true;
    await template.save();
  }

  /**
   * Get template statistics
   */
  static async getStats(): Promise<{
    total: number;
    active: number;
    byType: Record<TemplateType, number>;
    byLanguage: Record<string, number>;
  }> {
    const [total, active] = await Promise.all([
      this.count(),
      this.count({ where: { isActive: true } }),
    ]);

    // Count by type
    const byTypeResults = (await this.findAll({
      attributes: ["type", [fn("COUNT", col("id")), "count"]],
      group: ["type"],
      raw: true,
    })) as any[];

    const byType: Record<TemplateType, number> = {} as any;
    byTypeResults.forEach((result: any) => {
      byType[result.type as TemplateType] = parseInt(result.count);
    });

    // Count by language
    const byLanguageResults = (await this.findAll({
      attributes: ["language", [fn("COUNT", col("id")), "count"]],
      group: ["language"],
      raw: true,
    })) as any[];

    const byLanguage: Record<string, number> = {};
    byLanguageResults.forEach((result: any) => {
      byLanguage[result.language] = parseInt(result.count);
    });

    return {
      total,
      active,
      byType,
      byLanguage,
    };
  }
}

// Import for queries
import { fn, col } from "sequelize";
