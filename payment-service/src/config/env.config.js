"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.databaseConfig = void 0;
const enum_types_1 = require("../types/enum.types");
const getenv = (key) => {
    const foundEnv = process.env[key];
    if (!foundEnv) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return foundEnv;
};
exports.databaseConfig = {
    host: getenv(enum_types_1.environment_variables.DB_HOST),
    port: parseInt(getenv(enum_types_1.environment_variables.DB_PORT)),
    username: getenv(enum_types_1.environment_variables.DB_USERNAME),
    password: getenv(enum_types_1.environment_variables.DB_PASSWORD),
    database: getenv(enum_types_1.environment_variables.DB_NAME)
};
exports.config = {
    RABBITMQURL: getenv(enum_types_1.environment_variables.RABBITMQ_URL),
    EXCHANGE: getenv(enum_types_1.environment_variables.RABBITMQ_EXCHANGE),
    ROUTINGKEY: getenv(enum_types_1.environment_variables.AUTH_ROUTING_KEY),
    DEFAULTUSER: getenv(enum_types_1.environment_variables.RABBITMQ_DEFAULT_USER),
    DEFAULTPASS: getenv(enum_types_1.environment_variables.RABBITMQ_DEFAULT_PASS),
    SERVER_PORT: parseInt(getenv(enum_types_1.environment_variables.SERVER_PORT)),
    NODE_ENV: getenv(enum_types_1.environment_variables.NODE_ENV),
    AUTH_JWT_SECRET: getenv(enum_types_1.environment_variables.AUTH_JWT_SECRET),
    GATEWAY_SECRET_KEY: getenv(enum_types_1.environment_variables.GATEWAY_SECRET_KEY),
    PAYSTACK_SECRET_KEY: getenv(enum_types_1.environment_variables.PAYSTACK_SECRET_KEY),
    PAYSTACK_BASE_URL: getenv(enum_types_1.environment_variables.PAYSTACK_BASE_URL),
    REDIS_HOST: getenv(enum_types_1.environment_variables.REDIS_HOST),
    REDIS_PORT: getenv(enum_types_1.environment_variables.REDIS_PORT),
    REDIS_PASSWORD: getenv(enum_types_1.environment_variables.REDIS_PASSWORD),
    REDIS_DB: getenv(enum_types_1.environment_variables.REDIS_DB)
};
