import { PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { AiResponse } from "./ai_responses"
import { Session } from "./session"
import { Recommendation } from "./recommendation"


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
    evaluated_at!: Date

    @OneToMany(() => Recommendation, (recommendation) => recommendation.risk_event)
    recommendation!: RiskEvent

    @ManyToOne(() => AiResponse, (ai_response) => ai_response.risk_event)
    ai_response!: AiResponse

    @ManyToOne(() => Session, (session) => session.risk_event)
    session!: Session
}