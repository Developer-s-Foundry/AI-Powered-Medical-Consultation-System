import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RiskEvent } from "./risk_events";
import { Session } from "./session";

@Entity()
export class Escalation {
    @PrimaryGeneratedColumn()
    escalation_id!: string

    @Column()
    patient_id!: string

    @Column()
    escalation_type!: string // describing the escalation channel (alert, call, emergency dispatch, etc

    @CreateDateColumn() 
    notified_at!: Date  // when the escalation was sent

    @Column({type: Date})
    resolved_at!: Date // when the situation was marked resolved (nullable until resolved)

    @Column()
    resolved_by!: string // uuid of the doctor who closed the escalation 

    @OneToOne(() => RiskEvent, risk_event => risk_event.escalation)
    risk_event!: RiskEvent

    @ManyToOne(() => Session, session => session.escalation)
    session!: Session
}