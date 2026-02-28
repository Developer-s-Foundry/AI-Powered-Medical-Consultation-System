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
  rabbitmq: {
    url: string;
    exchange: string;
  };
  jwt: {
    secret: string;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  app: {
    name: process.env.SERVICE_NAME || "Drugs Service",
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3002"),
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/healthbridge_drugs",
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    exchange: process.env.RABBITMQ_EXCHANGE || "health-bridge-events",
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(` Warning: ${envVar} not set, using default value`);
  }
});

export default config;
