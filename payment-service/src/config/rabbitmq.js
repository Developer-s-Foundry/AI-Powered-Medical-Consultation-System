"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQConfig = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("./logger");
const env_config_1 = require("./env.config");
class RabbitMQConfig {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.url = env_config_1.config.RABBITMQURL;
        this.logger = logger_1.Logger.getInstance();
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.connection) {
                    this.connection = yield (amqplib_1.default.connect(this.url));
                }
                this.connection.on('error', (err) => {
                    this.logger.error('RabbitMQ connection error:', err);
                    this.timeoutRetrial(() => this.getConnection(), 5, 2000)
                        .catch(error => {
                        this.logger.error('Failed to reconnect to RabbitMQ after multiple attempts:', error);
                    });
                });
                this.connection.on('close', () => {
                    this.logger.warn('RabbitMQ connection closed');
                    this.timeoutRetrial(() => this.getConnection(), 5, 2000)
                        .catch(error => {
                        this.logger.error('Failed to reconnect to RabbitMQ after multiple attempts:', error);
                    });
                });
            }
            catch (error) {
                this.logger.error('Failed to connect to RabbitMQ:', error);
            }
            return this.connection;
        });
    }
    timeoutRetrial(fn, retries, delay) {
        return __awaiter(this, void 0, void 0, function* () {
            let attempt = 0;
            let connection = null;
            while (attempt < retries) {
                try {
                    connection = yield fn();
                    break;
                }
                catch (error) {
                    this.logger.error(`Attempt ${attempt + 1} failed:`, error);
                    if (attempt === retries - 1) {
                        throw new Error('Max retries reached. Operation failed.');
                    }
                    // Wait for the specified delay before retrying then resolve the promise
                    yield new Promise(resolve => setTimeout(resolve, delay));
                    attempt++;
                }
            }
            return connection;
        });
    }
    getChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel) {
                const connection = yield this.getConnection();
                this.channel = yield connection.createChannel();
            }
            return this.channel;
        });
    }
    // Close the connection and channel when the application is shutting down
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel) {
                yield this.channel.close();
            }
            if (this.connection) {
                yield this.connection.close();
            }
        });
    }
}
exports.RabbitMQConfig = RabbitMQConfig;
