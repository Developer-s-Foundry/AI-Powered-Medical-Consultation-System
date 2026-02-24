import { databaseConfig } from "./env.config";
import { DataSource } from "typeorm";
import { User } from "../model/entities/user.entity";
import { Role } from "../model/entities/roles.entity";
import { ResetPasswordToken } from "../model/entities/reset-password-token.entity";
import { RefreshToken } from "../model/entities/refresh-token.entity";
import { EmailVerificationToken } from "../model/entities/email-verification-token.entity";

const AppDataSource = new DataSource({
  type: "postgres",
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Role,
    ResetPasswordToken,
    RefreshToken,
    EmailVerificationToken,
  ],
  migrations: [],
});

export default AppDataSource;
