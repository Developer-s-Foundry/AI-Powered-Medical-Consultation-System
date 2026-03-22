import dotenv from "dotenv";
dotenv.config();
import express from "express";
import AppDataSource from "./config/database";
import { Logger } from "./config/logger";
import http from "http";
import { socketAuthMiddleware } from "./middleware/socket.middleware";
import { initializeSocket } from "./config/socket";

(async () => {
  const logger = Logger.getInstance();
  const port = process.env.PORT || process.env.SERVER_PORT || 3001;

  const app = express();
  const server = http.createServer(app);

  // middleware must be applied BEFORE initializeSocket
  const io = initializeSocket(server);
  io.use(socketAuthMiddleware);

  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");
    server.listen(port, () => {
      logger.logToConsole();
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
  }
})();
