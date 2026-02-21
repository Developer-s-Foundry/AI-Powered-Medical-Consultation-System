import { Sequelize } from "sequelize-typescript";
import { Drug } from "../models/Drug";
import { Prescription } from "../models/Prescription";
import { PrescriptionItem } from "../models/PrescriptionItem";
import logger from "../utils/logger";
import config from "./index";

const sequelize = new Sequelize(config.database.url, {
  dialect: "postgres",
  logging: (msg) => logger.debug(msg),
  models: [Drug, Prescription, PrescriptionItem],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

/**
 * Connect to database
 */
export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully");

    // Sync models in development
    if (config.app.env === "development") {
      await sequelize.sync({ alter: true });
      logger.info(" Database models synchronized");
    }
  } catch (error) {
    logger.error(" Database connection failed:", error);
    throw error;
  }
};

export default sequelize;
