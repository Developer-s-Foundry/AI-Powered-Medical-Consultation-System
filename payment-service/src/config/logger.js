"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
class Logger extends winston_1.default.Logger {
    constructor() {
        super();
        this.logger = winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.json(),
            defaultMeta: { service: 'auth-service' },
            transports: [
                //
                // - Write all logs with importance level of `error` or higher to `error.log`
                //   (i.e., error, fatal, but not other levels)
                //
                new winston_1.default.transports.File({ filename: 'error.log', level: 'error', format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()) }),
                //
                // - Write all logs with importance level of `info` or higher to `app.log`
                new winston_1.default.transports.File({ filename: 'app.log', level: 'info', format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()) }),
            ],
        });
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    logToConsole() {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.simple(),
            }));
        }
    }
}
exports.Logger = Logger;
