import winston from "winston";

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      defaultMeta: { service: "ai-service" },
      transports: [
        new winston.transports.File({
          filename: "error.log",
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: "app.log",
          level: "info",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, ...meta: any[]) {
    this.logger.info(message, ...meta);
  }

  public error(message: string, ...meta: any[]) {
    this.logger.error(message, ...meta);
  }

  public warn(message: string, ...meta: any[]) {
    this.logger.warn(message, ...meta);
  }

  public debug(message: string, ...meta: any[]) {
    this.logger.debug(message, ...meta);
  }

  public logToConsole() {
    if (process.env.NODE_ENV !== "production") {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
  }
}
