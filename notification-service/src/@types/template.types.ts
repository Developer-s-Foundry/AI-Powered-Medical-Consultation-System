export enum TemplateType {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
  APPOINTMENT_REQUEST = "appointment_request",
  APPOINTMENT_CONFIRMED = "appointment_confirmed",
  APPOINTMENT_CANCELLED = "appointment_cancelled",
  APPOINTMENT_REMINDER = "appointment_reminder",
  PRESCRIPTION_READY = "prescription_ready",
  PHARMACY_MATCHED = "pharmacy_matched",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  WELCOME = "welcome",
  GENERAL_NOTIFICATION = "general_notification",
}

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface NotificationTemplateAttributes {
  id?: string; // UUID
  type: TemplateType;
  name: string;
  description?: string;

  // Template content
  titleTemplate?: string;
  bodyTemplate?: string;
  emailSubjectTemplate?: string;
  emailBodyTemplate?: string;
  smsTemplate?: string;

  // Variables that this template expects
  variables?: TemplateVariable[];

  // Metadata
  isActive?: boolean;
  version?: number;
  language?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateRenderData {
  [key: string]: any;
}
