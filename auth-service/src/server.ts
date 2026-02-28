import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Role } from "./model/entities/roles.entity";
import AppDataSource from "./config/database";
import { Logger } from "./config/logger";
import { RabbitMQConfig } from "./config/rabbitmq";
import { Response as ExResponse, Request as ExRequest } from "express";
import { RegisterRoutes } from "./swagger/routes";
import swaggerUi from "swagger-ui-express";

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
  console.log("2. Logger and RabbitMQ config created");

  const port = process.env.PORT || 3004;
  const app: express.Application = express();

  app.use(express.json());
  console.log("3. Express setup done");
  app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.path);
    console.log("Body:", JSON.stringify(req.body));
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Content-Type:", req.headers["content-type"]);

    console.log("Raw headers:", JSON.stringify(req.headers));
    next();
  });

  RegisterRoutes(app);

  // Register Tsoa routes
  RegisterRoutes(app);
  console.log("4. Tsoa routes registered");

  // Swagger setup
  app.use(
    "/docs",
    swaggerUi.serve,
    async (_req: ExRequest, res: ExResponse) => {
      return res.send(
        swaggerUi.generateHTML(await import("./swagger/swagger.json" as any)),
      );
    },
  );
  console.log("5. Swagger UI setup done");

  try {
    console.log("6. Attempting to connect to the database...");
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");

    //Seed roles
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = ["patient", "doctor", "pharmacy"];
    for (const name of roles) {
      const exists = await roleRepository.findOne({ where: { name } });
      if (!exists) {
        await roleRepository.save(roleRepository.create({ name }));
      }
    }
    console.log("Roles seeded successfully.");
    // Initialize RabbitMQ connection
    try {
      console.log("7. Attempting to connect to RabbitMQ...");
      await rabbitMQ.getConnection();
      logger.info(" RabbitMQ connection established");
      console.log("RabbitMQ connection established successfully.");
    } catch (error) {
      console.error("RabbitMQ connection failed:", error);
      logger.warn(" RabbitMQ connection failed, events will not be published");
      logger.error("RabbitMQ error:", error);
      // Don't stop the server if RabbitMQ fails
    }

    console.log("8. Starting the server...");

    // Start the server
    app.listen(port, () => {
      logger.logToConsole();
      logger.info(`Server is running on port ${port}`);
      console.log(`Server is running on port ${port}`);
    });

    // Graceful shutdown (ADD THIS)
    process.on("SIGTERM", async () => {
      logger.info(" SIGTERM received, shutting down gracefully...");
      await rabbitMQ.closeConnection();
      await AppDataSource.destroy();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info(" SIGINT received, shutting down gracefully...");
      await rabbitMQ.closeConnection();
      await AppDataSource.destroy();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
    console.error("Fatal Error:", error);
    process.exit(1);
  }
})();
