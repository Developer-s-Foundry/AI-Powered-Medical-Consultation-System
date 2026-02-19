import { connectDB } from "../config/database";
import WorkerManager from "./index";
import eventConsumer from "../consumers/eventConsumer";
import logger from "../utils/logger";

/**
 * Start all workers and consumers
 */
async function start() {
  try {
    logger.info("Starting Notification Service Workers...");

    // Connect to database
    await connectDB();

    // Start workers
    await WorkerManager.startAll();

    // Start event consumer
    await eventConsumer.start();

    logger.info("All workers and consumers started successfully");

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully...");
      await shutdown();
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully...");
      await shutdown();
    });
  } catch (error) {
    logger.error("Failed to start workers:", error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  try {
    await Promise.all([WorkerManager.shutdownAll(), eventConsumer.shutdown()]);

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Start workers
start();
