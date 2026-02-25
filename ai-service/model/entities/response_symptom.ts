import { PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { AiResponse } from "./ai_responses"
import { SymptomCode } from "./symptom_code"


export class ResponseSymptom {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({
    type: 'decimal',
    precision: 4,
    scale: 3,
    })
    confidence!: string

    @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    })
    applied_weight!: string

    @ManyToOne(() => AiResponse, (ai_response) => ai_response.response_symptom)
    ai_response!: AiResponse

    @ManyToOne(() => SymptomCode, (symptom_code) => symptom_code.response_symptom)
    symptom_code!: SymptomCode

}