import dotenv from 'dotenv';
import express from 'express';
import AppDataSource from './config/database';
import { Logger } from './config/logger';
import { Response as ExResponse, Request as ExRequest } from "express";
import swaggerUi from "swagger-ui-express";





(async () => {

    dotenv.config();
    const logger = Logger.getInstance();

    const port = process.env.PORT;
    const app: express.Application = express();
    app.use(express.json());
        // Swagger setup
    app.use("/api", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
        return res.send(
            swaggerUi.generateHTML(await import("./swagger/swagger.json"))
        );
    });

    
    try {
       await AppDataSource.initialize();
       console.log('Database connection established successfully.');
       app.listen(port, () => {
            logger.logToConsole();
            logger.info(`Server is running on port ${port}`);
       });  
    } catch (error) {
        logger.error('Error starting server:', error);
    }
})();
