import { NotificationType, NotificationChannel } from "./notification.types";

export interface EmailJobData {
  userId: number;
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  notificationType: NotificationType;
}

export interface SmsJobData {
  userId: number;
  to: string;
  message: string;
  notificationType: NotificationType;
}

export interface QueueJobOptions {
  attempts?: number;
  backoff?: {
    type: "exponential" | "fixed";
    delay: number;
  };
  delay?: number;
  priority?: number;
}
