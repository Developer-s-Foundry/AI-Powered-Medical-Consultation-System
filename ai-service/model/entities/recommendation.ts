import { Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { RecommendationType } from "../types/enum.types"
import { Session } from "./session"
import { RiskEvent } from "./risk_events"

export class Recommendation {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    doctor_id!: string

    @Column({type: 'enum', enum: RecommendationType })
    rec_type!: string

    @Column()
    reason!: Text

    @CreateDateColumn()
    created_at!: Date

    @Column()
    accepted_by_patient!: boolean

    @ManyToOne(() => RiskEvent, (risk_event) => risk_event.recommendation)
    risk_event!: RiskEvent

    @ManyToOne(() => Session, (session) => session.recommendation)
    session!: Session

}