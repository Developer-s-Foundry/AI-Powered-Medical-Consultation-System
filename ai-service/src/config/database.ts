import { databaseConfig} from "./env.config";
import { DataSource } from "typeorm";
import path from "path";


const AppDataSource =  new DataSource({
    type: "postgres",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: true,
    logging: false,
    entities: [path.resolve(__dirname, "../**/*.entity.{js,ts}")],
    migrations: [path.resolve(__dirname, "../migrations/*.{js,ts}")],
});

export default AppDataSource;