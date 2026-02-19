import nodemailer, { Transporter } from "nodemailer";
import logger from "../utils/logger";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
};

const transporter: Transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter.verify((error) => {
  if (error) {
    logger.error(" Email configuration error:", error);
  } else {
    logger.info(" Email server ready");
  }
});

export default transporter;
