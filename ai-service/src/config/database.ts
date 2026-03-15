import { databaseConfig } from "./env.config";
import { DataSource } from "typeorm";
import { Session } from "../model/entities/session";
import { Message } from "../model/entities/messages";
import { AiResponse } from "../model/entities/ai_responses";
import { Recommendation } from "../model/entities/recommendation";
import { RiskEvent } from "../model/entities/risk_events";
import { SymptomCode } from "../model/entities/symptom_code";
import { ResponseSymptom } from "../model/entities/response_symptom";
import { Escalation } from "../model/entities/escalation";
import { ScoringRule } from "../model/entities/scoring_rule";
import { Specialty } from "../model/entities/specialty";
import { SymptomSpecialty } from "../model/entities/symptom_specialty";
import { Appointment } from "../model/entities/appointment";

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
    Session,
    Message,
    AiResponse,
    Recommendation,
    RiskEvent,
    SymptomCode,
    ResponseSymptom,
    Escalation,
    ScoringRule,
    Specialty,
    SymptomSpecialty,
    Appointment,
  ],
  migrations: [__dirname + "/../migrations/*.{js,ts}"],
});

export default AppDataSource;
