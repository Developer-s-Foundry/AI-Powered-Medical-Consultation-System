import dotenv from "dotenv";
import path from "path";

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
    from: string;
    sendgridApiKey: string;
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
    port: parseInt(process.env.PORT || "2002"),
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
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
    from: process.env.EMAIL_FROM || "Health Bridge <noreply@healthbridge.com>",
    sendgridApiKey: process.env.SENDGRID_API_KEY!,
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

const requiredEnvVars = ["DATABASE_URL", "SENDGRID_API_KEY", "EMAIL_FROM"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
