import { Sequelize } from "sequelize-typescript";
import { Notification } from "../models/Notification";
import { NotificationDeliveryLog } from "../models/NotificationDeliveryLog";
import { NotificationTemplate } from "../models/NotificationTemplate";
import logger from "../utils/logger";

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "postgres",
  logging: (msg) => logger.debug(msg),
  models: [Notification, NotificationDeliveryLog, NotificationTemplate], // Auto-load all models
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info(" Database connected successfully");

    // Sync models in development
    if (process.env.NODE_ENV === "development") {
      try {
        await sequelize.sync({ alter: true });
        logger.info(" Database models synchronized");
      } catch (err: any) {
        logger.warn(" Sync failed, possibly due to existing indexes. Skipping sync:", err.message);
      }
    }
  } catch (error: any) {
    logger.error("Failed to connect to database:", error);
    throw error;
  }
};

export default sequelize;
