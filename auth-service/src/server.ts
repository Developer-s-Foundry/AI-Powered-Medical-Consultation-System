import dotenv from "dotenv";
import "reflect-metadata";

dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";

import AppDataSource from "./config/database";
import { Logger } from "./config/logger";
import { RabbitMQConfig } from "./config/rabbitmq";
import { RegisterRoutes } from "./swagger/routes";
import { Role } from "./model/entities/roles.entity";
import { config } from "./config/env.config";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

(async () => {
  const logger = Logger.getInstance();
  const rabbitMQ = new RabbitMQConfig();
  const port = Number(config.PORT) || 3004;

  const app = express();

  // --- Middleware ---
  app.use(express.json());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`Incoming request: ${req.method} ${req.path}`);
    next();
  });

  // --- Routes ---
  RegisterRoutes(app); // Called once

  // --- Swagger ---
  app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
    return res.send(
      swaggerUi.generateHTML(await import("./swagger/swagger.json" as any)),
    );
  });

  // --- Database ---
  try {
    logger.info("Connecting to the database...");
    await AppDataSource.initialize();
    logger.info("Database connection established.");

    // Seed roles
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = ["patient", "doctor", "pharmacy"];
    for (const name of roles) {
      const exists = await roleRepository.findOne({ where: { name } });
      if (!exists) {
        await roleRepository.save(roleRepository.create({ name }));
      }
    }
    logger.info("Roles seeded.");
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
  }

  // --- RabbitMQ ---
  try {
    logger.info("Connecting to RabbitMQ...");
    await rabbitMQ.getConnection();
    logger.info("RabbitMQ connection established.");
  } catch (error) {
    logger.warn("RabbitMQ connection failed — events will not be published.");
    logger.error("RabbitMQ error:", error);
    // Non-fatal: server continues without message queue
  }

  // --- Start Server ---
  app.listen(port, "0.0.0.0", () => {
    logger.info(`Server running on port ${port}`);
  });

  // --- Graceful Shutdown ---
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    await rabbitMQ.closeConnection();
    await AppDataSource.destroy();
    process.exit(0);
  };

  process.on("exit", (code) => {
    console.log(`Process exiting with code: ${code}`);
  });

  console.log("9. Server fully initialized, keeping process alive...");
})();
