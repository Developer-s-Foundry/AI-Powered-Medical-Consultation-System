import { environment_variables } from "../types/enum.types";


const getenv = (key: environment_variables): string => {
    const foundEnv = process.env[key];
    if (!foundEnv) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return foundEnv;
}

export const databaseConfig = {
    host: getenv(environment_variables.DB_HOST),
    port: parseInt(getenv(environment_variables.DB_PORT)),
    username: getenv(environment_variables.DB_USERNAME),
    password: getenv(environment_variables.DB_PASSWORD),
    database: getenv(environment_variables.DB_NAME)
}

export const config = {
    RABBITMQURL: getenv(environment_variables.RABBITMQ_URL),
    EXCHANGE: getenv(environment_variables.RABBITMQ_EXCHANGE),
    ROUTINGKEY: getenv(environment_variables.AUTH_ROUTING_KEY),
    DEFAULTUSER: getenv(environment_variables.RABBITMQ_DEFAULT_USER),
    DEFAULTPASS: getenv(environment_variables.RABBITMQ_DEFAULT_PASS),
    SERVER_PORT: parseInt(getenv(environment_variables.SERVER_PORT)),
    NODE_ENV: getenv(environment_variables.NODE_ENV),
    AUTH_JWT_SECRET: getenv(environment_variables.AUTH_JWT_SECRET),
    GATEWAY_SECRET_KEY: getenv(environment_variables.GATEWAY_SECRET_KEY),
    PAYSTACK_SECRET_KEY: getenv(environment_variables.PAYSTACK_SECRET_KEY),
    PAYSTACK_BASE_URL: getenv(environment_variables.PAYSTACK_BASE_URL),
    REDIS_HOST: getenv(environment_variables.REDIS_HOST)
    REDIS_PORT: getenv(environment_variables.REDIS_PORT)
    REDIS_PASSWORD: getenv(environment_variables.REDIS_PASSWORD)
    REDIS_DB: getenv(environment_variables.REDIS_DB)
}