import { RiskLevel } from '../../types/enum.types';
import { Column, CreateDateColumn, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Session } from './session';
import { ResponseSymptom } from './response_symptom';
import { Message } from './messages';
import { RiskEvent } from './risk_events';
import { RawAIResponse } from '../../types/types.interface';


export class AiResponse {

    @PrimaryGeneratedColumn('uuid')
    response_id!: string

    @Column({type:'json', nullable:true})
    raw_json!: RawAIResponse // JSONB of the full payload the AI returned, stored for debugging and auditing

    @Column({type: 'enum', enum: RiskLevel })
    risk_level!: string //the AI's assessed level: HIGH, MEDIUM, or LOW

    @Column({ nullable: true})
    ai_advice!: string | null // the advice text the AI generated

    @Column()
    json_valid!: boolean

    @Column()
    advice_used!: boolean

    @Column()
    model_version!: string // AI model version that produced this response

    @CreateDateColumn()
    created_at!: Date

    @OneToMany(() => ResponseSymptom, (response_symptom) => response_symptom.ai_response)
    response_symptom!: ResponseSymptom []

    @OneToOne(() => Message, (message) => message.ai_response)
    @JoinColumn()
    message!: Message

    @ManyToOne(() => Session, (session) => session.ai_response)
    session!: Session

    @OneToMany(() => RiskEvent, (risk_event) => risk_event.ai_response)
    risk_event!: RiskEvent []
}
