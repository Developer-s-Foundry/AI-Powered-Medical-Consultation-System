import { CreateDateColumn, PrimaryGeneratedColumn,OneToOne ,Column, OneToMany } from "typeorm"
import { RiskLevel, SessionStatus } from "../../types/enum.types"
import { AiResponse } from "./ai_responses"
import { Message } from "./messages"
import { Appointment } from "./appointment"
import { RiskEvent } from "./risk_events"
import { Recommendation } from "./recommendation"
import { Escalation } from "./escalation"


export class Session {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    patient_id!: string //one patient can have many sessions

    @CreateDateColumn()
    started_at!: Date
    
    @Column()
    ended_at!: Date

    @Column({type: 'enum', enum: SessionStatus})
    session_status!: string

    @Column({type: 'enum', enum: RiskLevel})
    final_risk_level!: string //the resolved risk level at session close

    @OneToMany(() => AiResponse, (ai_response) =>ai_response.session)
    ai_response!: AiResponse []

    @OneToMany(() => Message, (message) => message.session)
    message!: Message []

    @OneToOne(() => Appointment, appointment => appointment.session)
    appointment!: Appointment

    @OneToMany(() => RiskEvent, (risk_event) => risk_event.session)
    risk_event!: RiskEvent []

    @OneToMany(() => Recommendation, (recommendation) => recommendation.session)
    recommendation!: Session []

    @OneToMany(() => Escalation, escalation => escalation.session)
    escalation!: Escalation []
}