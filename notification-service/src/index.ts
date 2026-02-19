import { connectDB } from "./config/database";
import rabbitmqConnection from "./config/rabbitmq";
import WorkerManager from "./workers";
import eventConsumer from "./consumers/eventConsumer";
import logger from "./utils/logger";
import config from "./config";

/**
 * Start Notification Service (Event-Driven Only)
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

    logger.info("");
    logger.info("=================================================");
    logger.info("Notification Service Started Successfully!");
    logger.info("=================================================");
    logger.info("Listening for events from other services...");
    logger.info("Workers ready to process notifications");
    logger.info("Service is operational");
    logger.info("");

    // Setup graceful shutdown handlers
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
  // Handle SIGTERM (e.g., from Kubernetes)
  process.on("SIGTERM", () => {
    logger.info("");
    logger.info("SIGTERM signal received");
    shutdown("SIGTERM");
  });

  // Handle SIGINT (e.g., Ctrl+C)
  process.on("SIGINT", () => {
    logger.info("");
    logger.info("SIGINT signal received (Ctrl+C)");
    shutdown("SIGINT");
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("");
    logger.error("UNCAUGHT EXCEPTION:");
    logger.error(error);
    shutdown("UNCAUGHT_EXCEPTION");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("");
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
    // Stop accepting new events
    logger.info("1/3 Stopping event consumer...");
    await eventConsumer.shutdown();

    // Wait for current jobs to complete
    logger.info("2/3 Shutting down workers...");
    await WorkerManager.shutdownAll();

    // Close connections
    logger.info("3/3 Closing connections...");
    await rabbitmqConnection.close();

    logger.info("");
    logger.info("=================================================");
    logger.info("Graceful Shutdown Completed Successfully");
    logger.info("=================================================");
    process.exit(0);
  } catch (error) {
    logger.error("=================================================");
    logger.error("Error During Shutdown");
    logger.error("=================================================");
    logger.error(error);
    process.exit(1);
  }
}

// Start the service
start();
