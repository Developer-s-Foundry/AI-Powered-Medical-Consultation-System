import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { RiskLevel } from "../types/enum.types"
import { Scoring } from "./scoring_rule"
import { ResponseSymptom } from "./response_symptom"


export class SymptomCode {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    code!: string //short unique code like SYM-042, used in the AI's symptom_codes array

    @Column()
    description!: Text //human-readable label of the symptom

     @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    })
    default_weight!: string //the base numeric weight applied in weighted scoring

    @Column({type: 'enum', enum: RiskLevel})
    severity_class!: string

    @OneToMany(() => Scoring, scoring => scoring.symptom_code)
    scoring!: Scoring []

    @OneToMany(() => ResponseSymptom, (response_symptom) => response_symptom.symptom_code)
    response_symptom!: SymptomCode []
    
}