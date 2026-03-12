import sgMail from "@sendgrid/mail";
import logger from "../utils/logger";

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  logger.error("Missing SENDGRID_API_KEY environment variable");
} else {
  sgMail.setApiKey(apiKey);
  logger.info("SendGrid email client ready");
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const msg = {
    to: options.to,
    from: options.from || process.env.EMAIL_FROM || "noreply@healthbridge.com",
    subject: options.subject,
    html: options.html,
    ...(options.text && { text: options.text }),
  };

  try {
    await sgMail.send(msg);
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};

export default sendEmail;
