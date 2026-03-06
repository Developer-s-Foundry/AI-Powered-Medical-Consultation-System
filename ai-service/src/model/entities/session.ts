import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  Column,
  OneToMany,
  Entity,
} from "typeorm";
import { RiskLevel, SessionStatus } from "../../types/enum.types";
import { AiResponse } from "./ai_responses";
import { Message } from "./messages";
import { Booking } from "./booking";
import { RiskEvent } from "./risk_events";
import { Recommendation } from "./recommendation";
import { Escalation } from "./escalation";

@Entity()
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  patient_id!: string; //one patient can have many sessions

  @CreateDateColumn()
  started_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  ended_at!: Date | null;

  @Column({ type: "enum", enum: Object.values(SessionStatus) })
  session_status!: string;

  @Column({ type: "enum", enum: Object.values(RiskLevel), nullable: true })
  final_risk_level!: string | null; //the resolved risk level at session close

  @OneToMany(() => AiResponse, (ai_response) => ai_response.session)
  ai_response!: AiResponse[];

  @OneToMany(() => Message, (message) => message.session)
  message!: Message[];

  @OneToOne(() => Booking, (booking) => booking.session)
  booking!: Booking;

  @OneToMany(() => RiskEvent, (risk_event) => risk_event.session)
  risk_event!: RiskEvent[];

  @OneToMany(() => Recommendation, (recommendation) => recommendation.session)
  recommendation!: Session[];

  @OneToMany(() => Escalation, (escalation) => escalation.session)
  escalation!: Escalation[];
}
