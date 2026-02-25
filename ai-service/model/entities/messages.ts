import { Column, CreateDateColumn,OneToOne, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { MessageDirection } from "../types/enum.types"
import { AiResponse } from "./ai_responses"
import { Session } from "./session"


export class Message {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    patient_id!: string

    @Column()
    content!: Text // the raw text of the message

    @CreateDateColumn()
    created_at!: Date

    @Column({type: 'enum', enum: MessageDirection })
    direction!: MessageDirection // (in = patient, out = system response) so both sides of the conversation live in one table

    @Column({default: false})
    is_sanitized!: boolean //flag indicating whether the outbound message had its AI advice sanitized (relevant for LOW risk)

    @ManyToOne(() => Session, (session) => session.message)
    session!: Session

    @OneToOne(() => AiResponse, (ai_response) => ai_response.message)
    ai_response!: AiResponse
}