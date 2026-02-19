import { NotificationTemplate } from "../models/NotificationTemplate";
import {
  TemplateType,
  NotificationTemplateAttributes,
  TemplateRenderData,
} from "../@types/template.types";

export class TemplateRepository {
  /**
   * Create a new template
   */
  async create(
    data: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate> {
    return NotificationTemplate.create(data as any);
  }

  /**
   * Find template by ID
   */
  async findById(id: string): Promise<NotificationTemplate | null> {
    return NotificationTemplate.findByPk(id);
  }

  /**
   * Find active template by type
   */
  async findByType(
    type: TemplateType,
    language: string = "en",
  ): Promise<NotificationTemplate | null> {
    return NotificationTemplate.findByType(type, language);
  }

  /**
   * Find all active templates
   */
  async findAllActive(
    language: string = "en",
  ): Promise<NotificationTemplate[]> {
    return NotificationTemplate.findAllActive(language);
  }

  /**
   * Find all versions of a template
   */
  async findVersions(
    type: TemplateType,
    language: string = "en",
  ): Promise<NotificationTemplate[]> {
    return NotificationTemplate.findVersions(type, language);
  }

  /**
   * Update template
   */
  async update(
    id: string,
    data: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate | null> {
    const template = await this.findById(id);
    if (!template) return null;

    await template.update(data);
    return template;
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<boolean> {
    const deleted = await NotificationTemplate.destroy({ where: { id } });
    return deleted > 0;
  }

  /**
   * Activate template
   */
  async activate(id: string): Promise<void> {
    return NotificationTemplate.activate(id);
  }

  /**
   * Deactivate template
   */
  async deactivate(id: string): Promise<void> {
    return NotificationTemplate.deactivate(id);
  }

  /**
   * Create new version of template
   */
  async createVersion(
    id: string,
    updates: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate | null> {
    const template = await this.findById(id);
    if (!template) return null;

    return template.createVersion(updates);
  }

  /**
   * Render template with data
   */
  async renderTemplate(
    type: TemplateType,
    data: TemplateRenderData,
    language: string = "en",
  ): Promise<{
    title: string | null;
    body: string | null;
    emailSubject: string | null;
    emailBody: string | null;
    sms: string | null;
  } | null> {
    const template = await this.findByType(type, language);
    if (!template) return null;

    // Validate data
    const validation = template.validateData(data);
    if (!validation.valid) {
      throw new Error(
        `Missing required variables: ${validation.missing.join(", ")}`,
      );
    }

    return template.renderAll(data);
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    return NotificationTemplate.getStats();
  }
}

export default new TemplateRepository();
