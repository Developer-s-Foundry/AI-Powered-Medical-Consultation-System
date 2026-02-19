import { NotificationTemplate } from "../models/NotificationTemplate";
import {
  TemplateType,
  NotificationTemplateAttributes,
  TemplateRenderData,
} from "../@types/template.types";
import Handlebars from "handlebars";
import logger from "../utils/logger";

export class TemplateService {
  /**
   * Register custom Handlebars helpers
   */
  constructor() {
    this.registerHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper("formatDate", (date: Date, format: string) => {
      if (!date) return "";

      const d = new Date(date);

      switch (format) {
        case "short":
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        case "long":
          return d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        case "time":
          return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        default:
          return d.toLocaleDateString();
      }
    });

    // Currency formatting helper
    Handlebars.registerHelper(
      "currency",
      (amount: number, currency: string = "NGN") => {
        if (amount === null || amount === undefined) return "";

        const symbol =
          currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
        return `${symbol}${amount.toLocaleString()}`;
      },
    );

    // Uppercase helper
    Handlebars.registerHelper("uppercase", (str: string) => {
      return str ? str.toUpperCase() : "";
    });

    // Lowercase helper
    Handlebars.registerHelper("lowercase", (str: string) => {
      return str ? str.toLowerCase() : "";
    });

    // Capitalize helper
    Handlebars.registerHelper("capitalize", (str: string) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // Truncate helper
    Handlebars.registerHelper(
      "truncate",
      (str: string, length: number = 50) => {
        if (!str) return "";
        if (str.length <= length) return str;
        return str.substring(0, length) + "...";
      },
    );

    // Conditional equals helper
    Handlebars.registerHelper("eq", (a: any, b: any) => {
      return a === b;
    });

    // Join array helper
    Handlebars.registerHelper(
      "join",
      (array: any[], separator: string = ", ") => {
        if (!Array.isArray(array)) return "";
        return array.join(separator);
      },
    );

    logger.info("Handlebars helpers registered");
  }

  /**
   * Get template by type
   */
  async getTemplate(
    type: TemplateType,
    language: string = "en",
  ): Promise<NotificationTemplate | null> {
    try {
      const template = await NotificationTemplate.findByType(type, language);

      if (!template) {
        logger.warn(`Template not found: type=${type}, language=${language}`);
        return null;
      }

      if (!template.isActive) {
        logger.warn(`Template is inactive: type=${type}, language=${language}`);
        return null;
      }

      return template;
    } catch (error) {
      logger.error("Error fetching template:", error);
      throw error;
    }
  }

  /**
   * Render template with data
   */
  async render(
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
    try {
      const template = await this.getTemplate(type, language);

      if (!template) {
        logger.error(`Cannot render: template not found for type=${type}`);
        return null;
      }

      // Validate required variables
      const validation = template.validateData(data);
      if (!validation.valid) {
        const errorMsg = `Missing required variables: ${validation.missing.join(", ")}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Render all templates
      const rendered = template.renderAll(data);

      logger.info(`Template rendered successfully: type=${type}`);
      return rendered;
    } catch (error) {
      logger.error("Error rendering template:", error);
      throw error;
    }
  }

  /**
   * Render only email subject and body
   */
  async renderEmail(
    type: TemplateType,
    data: TemplateRenderData,
    language: string = "en",
  ): Promise<{ subject: string; body: string } | null> {
    try {
      const rendered = await this.render(type, data, language);

      if (!rendered || !rendered.emailSubject || !rendered.emailBody) {
        logger.error("Email templates not found or empty");
        return null;
      }

      return {
        subject: rendered.emailSubject,
        body: rendered.emailBody,
      };
    } catch (error) {
      logger.error("Error rendering email template:", error);
      throw error;
    }
  }

  /**
   * Render only SMS
   */
  async renderSms(
    type: TemplateType,
    data: TemplateRenderData,
    language: string = "en",
  ): Promise<string | null> {
    try {
      const rendered = await this.render(type, data, language);

      if (!rendered || !rendered.sms) {
        logger.error("SMS template not found or empty");
        return null;
      }

      return rendered.sms;
    } catch (error) {
      logger.error("Error rendering SMS template:", error);
      throw error;
    }
  }

  /**
   * Render title and body (for in-app notifications)
   */
  async renderNotification(
    type: TemplateType,
    data: TemplateRenderData,
    language: string = "en",
  ): Promise<{ title: string; body: string } | null> {
    try {
      const rendered = await this.render(type, data, language);

      if (!rendered || !rendered.title || !rendered.body) {
        logger.error("Notification templates not found or empty");
        return null;
      }

      return {
        title: rendered.title,
        body: rendered.body,
      };
    } catch (error) {
      logger.error("Error rendering notification template:", error);
      throw error;
    }
  }

  /**
   * Validate template data without rendering
   */
  async validateData(
    type: TemplateType,
    data: TemplateRenderData,
    language: string = "en",
  ): Promise<{ valid: boolean; missing: string[] }> {
    try {
      const template = await this.getTemplate(type, language);

      if (!template) {
        return { valid: false, missing: ["Template not found"] };
      }

      return template.validateData(data);
    } catch (error) {
      logger.error("Error validating template data:", error);
      return { valid: false, missing: ["Validation error"] };
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(
    data: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate> {
    try {
      const template = await NotificationTemplate.create(data as any);
      logger.info(`Template created: type=${template.type}, id=${template.id}`);
      return template;
    } catch (error) {
      logger.error("Error creating template:", error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(
    id: string,
    data: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate | null> {
    try {
      const template = await NotificationTemplate.findByPk(id);

      if (!template) {
        logger.error(`Template not found: id=${id}`);
        return null;
      }

      await template.update(data);
      logger.info(`Template updated: id=${id}`);
      return template;
    } catch (error) {
      logger.error("Error updating template:", error);
      throw error;
    }
  }

  /**
   * Create new version of template
   */
  async createVersion(
    id: string,
    updates: Partial<NotificationTemplateAttributes>,
  ): Promise<NotificationTemplate | null> {
    try {
      const template = await NotificationTemplate.findByPk(id);

      if (!template) {
        logger.error(`Template not found: id=${id}`);
        return null;
      }

      const newVersion = await template.createVersion(updates);
      logger.info(
        `New template version created: type=${template.type}, version=${newVersion.version}`,
      );
      return newVersion;
    } catch (error) {
      logger.error("Error creating template version:", error);
      throw error;
    }
  }

  /**
   * Activate template
   */
  async activateTemplate(id: string): Promise<void> {
    try {
      await NotificationTemplate.activate(id);
      logger.info(`Template activated: id=${id}`);
    } catch (error) {
      logger.error("Error activating template:", error);
      throw error;
    }
  }

  /**
   * Deactivate template
   */
  async deactivateTemplate(id: string): Promise<void> {
    try {
      await NotificationTemplate.deactivate(id);
      logger.info(`Template deactivated: id=${id}`);
    } catch (error) {
      logger.error("Error deactivating template:", error);
      throw error;
    }
  }

  /**
   * Get all active templates
   */
  async getAllActiveTemplates(
    language: string = "en",
  ): Promise<NotificationTemplate[]> {
    try {
      return await NotificationTemplate.findAllActive(language);
    } catch (error) {
      logger.error("Error fetching active templates:", error);
      throw error;
    }
  }

  /**
   * Get template versions
   */
  async getTemplateVersions(
    type: TemplateType,
    language: string = "en",
  ): Promise<NotificationTemplate[]> {
    try {
      return await NotificationTemplate.findVersions(type, language);
    } catch (error) {
      logger.error("Error fetching template versions:", error);
      throw error;
    }
  }

  /**
   * Test template rendering with sample data
   */
  async testRender(type: TemplateType, language: string = "en"): Promise<any> {
    try {
      const template = await this.getTemplate(type, language);

      if (!template) {
        throw new Error("Template not found");
      }

      // Create sample data from template variables
      const sampleData: TemplateRenderData = {};

      if (template.variables) {
        template.variables.forEach((variable) => {
          sampleData[variable.name] = variable.example;
        });
      }

      // Render with sample data
      const rendered = await this.render(type, sampleData, language);

      return {
        template: {
          id: template.id,
          type: template.type,
          version: template.version,
          variables: template.variables,
        },
        sampleData,
        rendered,
      };
    } catch (error) {
      logger.error("Error testing template:", error);
      throw error;
    }
  }
}

export default new TemplateService();
