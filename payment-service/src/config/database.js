"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("./env.config");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: env_config_1.databaseConfig.host,
    port: env_config_1.databaseConfig.port,
    username: env_config_1.databaseConfig.username,
    password: env_config_1.databaseConfig.password,
    database: env_config_1.databaseConfig.database,
    synchronize: true,
    logging: false,
    entities: [path_1.default.resolve(__dirname, "../**/*.entity.{js,ts}")],
    migrations: [path_1.default.resolve(__dirname, "../migrations/*.{js,ts}")],
});
exports.default = AppDataSource;
