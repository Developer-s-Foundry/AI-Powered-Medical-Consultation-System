import { PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, CreateDateColumn } from "typeorm"
import { AiResponse } from "./ai_responses"
import { Session } from "./session"
import { Recommendation } from "./recommendation"
import { Escalation } from "./escalation"


export class RiskEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type: 'enum', enum: RiskEvent})
    risk_level!: string

    @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    })
    weighted_score!: string

    @Column()
    advice_shown!: boolean

    @Column()
    action_taken!: string

    @CreateDateColumn()
    evaluated_at!: Date

    @OneToMany(() => Recommendation, (recommendation) => recommendation.risk_event)
    recommendation!: RiskEvent

    @ManyToOne(() => AiResponse, (ai_response) => ai_response.risk_event)
    ai_response!: AiResponse

    @OneToOne(() => Escalation, escalation => escalation.risk_event)
    escalation!: Escalation

    @ManyToOne(() => Session, (session) => session.risk_event)
    session!: Session
}