import dotenv, { config } from "dotenv";
dotenv.config();
import express from "express";
import AppDataSource from "./config/database";
import { Logger } from "./config/logger";
//import { Response as ExResponse, Request as ExRequest } from "express";
//import swaggerUi from "swagger-ui-express";
//import { Registeroutes } from './swagger/routes'
import http from "http";
import { socketAuthMiddleware } from "./middleware/socket.middleware";
import { initializeSocket } from "./config/socket";

(async () => {
  dotenv.config();
  const logger = Logger.getInstance();

  const port = process.env.SERVER_PORT;
  // const app: express.Application = express();
  //  app.use(express.json());

  //initialize socket with server
  const server = http.createServer();
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
