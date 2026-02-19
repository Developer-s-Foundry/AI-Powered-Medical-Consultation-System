export enum RecipientType {
  PATIENT = "patient",
  DOCTOR = "doctor",
  PHARMACY = "pharmacy",
  LAB = "lab",
  WELLNESS_CENTER = "wellness_center",
  ADMIN = "admin",
}

export enum NotificationType {
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
  GENERAL = "general",
}

export enum ReferenceType {
  USER = "user",
  APPOINTMENT = "appointment",
  PRESCRIPTION = "prescription",
  BOOKING = "booking",
  TRANSACTION = "transaction",
  PHARMACY_ORDER = "pharmacy_order",
  LAB_BOOKING = "lab_booking",
  NONE = "none",
}

export interface NotificationAttributes {
  id?: string; // UUID
  recipientId: string; // UUID
  recipientType: RecipientType;
  type: NotificationType;
  referenceType: ReferenceType;
  referenceId?: string; // UUID
  title: string;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
}
