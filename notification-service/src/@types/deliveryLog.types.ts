export enum DeliveryStatus {
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  BOUNCED = "bounced",
  REJECTED = "rejected",
}

export enum DeliveryProvider {
  NODEMAILER = "nodemailer",
  SENDGRID = "sendgrid",
  MAILGUN = "mailgun",
  TWILIO = "twilio",
  TWILIO_SENDGRID = "twilio_sendgrid",
  AWS_SES = "aws_ses",
  INTERNAL = "internal",
}

export interface DeliveryLogAttributes {
  id?: string; // UUID
  notificationId: string; // UUID
  status: DeliveryStatus;
  provider: DeliveryProvider;
  providerMessageId?: string;
  errorMessage?: string;
  retryCount: number;
  attemptedAt: Date;
  deliveredAt?: Date;
}
