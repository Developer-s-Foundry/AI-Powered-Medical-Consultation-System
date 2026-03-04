import winston from 'winston';


export class Logger extends winston.Logger {
    private static instance: Logger;
    private logger: winston.Logger;

    private constructor() {
      super();
        this.logger = winston.createLogger({
              level: 'info',
              format: winston.format.json(),
              defaultMeta: { service: 'auth-service' },
              transports: [
                //
                // - Write all logs with importance level of `error` or higher to `error.log`
                //   (i.e., error, fatal, but not other levels)
                //
                new winston.transports.File({ filename: 'error.log', level: 'error', format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )}),
                //
                // - Write all logs with importance level of `info` or higher to `app.log`
                new winston.transports.File({ filename: 'app.log' , level: 'info' , format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )}),
              ],
            });
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    //
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
    public logToConsole() {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
  }

}