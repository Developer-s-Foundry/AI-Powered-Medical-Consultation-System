import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import rabbitmqConnection from "./config/rabbitmq";
import WorkerManager from "./workers";
import eventConsumer from "./consumers/eventConsumer";
import notificationRoutes from "./routes/notification.routes";
import logger from "./utils/logger";
import config from "./config";

/**
 * Start Notification Service (Event-Driven + REST)
 */
async function start() {
  try {
    logger.info("=================================================");
    logger.info("Starting Health Bridge Notification Service");
    logger.info("=================================================");
    logger.info(`Environment: ${config.app.env}`);
    logger.info(`Service Version: 1.0.0`);
    logger.info("");

    // 1. Connect to PostgreSQL
    logger.info(" Connecting to PostgreSQL...");
    await connectDB();

    // 2. Connect to RabbitMQ
    logger.info(" Connecting to RabbitMQ...");
    await rabbitmqConnection.connect();

    // 3. Start workers (Email & SMS processors)
    logger.info(" Starting workers...");
    await WorkerManager.startAll();

    // 4. Start event consumer (listens to RabbitMQ events)
    logger.info(" Starting event consumer...");
    await eventConsumer.start();

    // 5. Start Express REST server (for frontend to read notifications)
    logger.info(" Starting REST server...");
    const app = express();
    app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
    app.use(express.json());
    app.use("/api/notifications", notificationRoutes);

    const port = process.env.PORT || 3005;
    app.listen(port, () => {
      logger.info(`REST server listening on port ${port}`);
    });

    logger.info("");
    logger.info("=================================================");
    logger.info("Notification Service Started Successfully!");
    logger.info("=================================================");
    logger.info("Listening for events from other services...");
    logger.info("Workers ready to process notifications");
    logger.info("REST API ready for frontend reads");
    logger.info("Service is operational");
    logger.info("");

    setupGracefulShutdown();
  } catch (error) {
    logger.error("=================================================");
    logger.error("FATAL ERROR - Failed to start service");
    logger.error("=================================================");
    logger.error(error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received");
    shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT signal received (Ctrl+C)");
    shutdown("SIGINT");
  });

  process.on("uncaughtException", (error) => {
    logger.error("UNCAUGHT EXCEPTION:");
    logger.error(error);
    shutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("UNHANDLED REJECTION:");
    logger.error("Promise:", promise);
    logger.error("Reason:", reason);
    shutdown("UNHANDLED_REJECTION");
  });
}

/**
 * Graceful shutdown
 */
async function shutdown(signal: string) {
  logger.info("=================================================");
  logger.info(`Graceful Shutdown Initiated (${signal})`);
  logger.info("=================================================");

  try {
    logger.info("1/3 Stopping event consumer...");
    await eventConsumer.shutdown();

    logger.info("2/3 Shutting down workers...");
    await WorkerManager.shutdownAll();

    logger.info("3/3 Closing connections...");
    await rabbitmqConnection.close();

    logger.info("Graceful Shutdown Completed Successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error During Shutdown");
    logger.error(error);
    process.exit(1);
  }
}

start();
