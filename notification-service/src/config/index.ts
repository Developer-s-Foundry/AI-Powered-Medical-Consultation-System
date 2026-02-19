import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

interface Config {
  app: {
    name: string;
    env: string;
    port: number;
    clientUrl: string;
  };
  database: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  rabbitmq: {
    url: string;
    exchange: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  sms: {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
  };
  logging: {
    level: string;
  };
  queue: {
    emailAttempts: number;
    smsAttempts: number;
    backoffDelay: number;
  };
}

const config: Config = {
  app: {
    name: "Notification Service",
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3007"),
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    exchange: process.env.RABBITMQ_EXCHANGE || "health-bridge-events",
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER!,
    password: process.env.EMAIL_PASSWORD!,
    from: process.env.EMAIL_FROM || "Health Bridge <noreply@healthbridge.com>",
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  queue: {
    emailAttempts: parseInt(process.env.EMAIL_ATTEMPTS || "3"),
    smsAttempts: parseInt(process.env.SMS_ATTEMPTS || "3"),
    backoffDelay: parseInt(process.env.BACKOFF_DELAY || "5000"),
  },
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "EMAIL_USER", "EMAIL_PASSWORD"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
