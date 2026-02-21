import app from "./app";
import { connectDB } from "./config/database";
import rabbitmqConnection from "./config/rabbitmq";
import config from "./config";
import logger from "./utils/logger";

/**
 * Start server
 */
async function startServer() {
  try {
    logger.info("=================================================");
    logger.info(` Starting ${config.app.name}`);
    logger.info("=================================================");
    logger.info(`Environment: ${config.app.env}`);
    logger.info(`Port: ${config.app.port}`);
    logger.info("");

    // 1. Connect to PostgreSQL
    logger.info(" Connecting to PostgreSQL...");
    await connectDB();

    // 2. Connect to RabbitMQ
    logger.info(" Connecting to RabbitMQ...");
    await rabbitmqConnection.connect();

    // 3. Start Express server
    const server = app.listen(config.app.port, () => {
      logger.info("");
      logger.info("=================================================");
      logger.info(` ${config.app.name} Started Successfully!`);
      logger.info("=================================================");
      logger.info(` Server: http://localhost:${config.app.port}`);
      logger.info(` Health: http://localhost:${config.app.port}/health`);
      logger.info(` API: http://localhost:${config.app.port}/api`);
      logger.info("");
      logger.info("Available Endpoints:");
      logger.info(`  - Patients: /api/patients`);
      logger.info(`  - Doctors: /api/doctors`);
      logger.info(`  - Pharmacies: /api/pharmacies`);
      logger.info("=================================================");
      logger.info("");
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
    logger.error("=================================================");
    logger.error(" FATAL ERROR - Failed to start server");
    logger.error("=================================================");
    logger.error(error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(server: any) {
  const shutdown = async (signal: string) => {
    logger.info("");
    logger.info("=================================================");
    logger.info(` ${signal} received - Graceful Shutdown Initiated`);
    logger.info("=================================================");

    // Stop accepting new connections
    server.close(async () => {
      logger.info("1/2 HTTP server closed");

      try {
        // Close database and message broker connections
        await rabbitmqConnection.close();
        logger.info("2/2 RabbitMQ connection closed");

        logger.info("");
        logger.info("=================================================");
        logger.info(" Graceful Shutdown Completed Successfully");
        logger.info("=================================================");
        process.exit(0);
      } catch (error) {
        logger.error(" Error during shutdown:", error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error("");
      logger.error(" Forced shutdown after 30s timeout");
      process.exit(1);
    }, 30000);
  };

  // Handle different termination signals
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught errors
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error("");
    logger.error(" UNHANDLED REJECTION:");
    logger.error("Promise:", promise);
    logger.error("Reason:", reason);
    shutdown("UNHANDLED_REJECTION");
  });

  process.on("uncaughtException", (error: Error) => {
    logger.error("");
    logger.error("UNCAUGHT EXCEPTION:");
    logger.error(error);
    shutdown("UNCAUGHT_EXCEPTION");
  });
}

// Start the server
startServer();
