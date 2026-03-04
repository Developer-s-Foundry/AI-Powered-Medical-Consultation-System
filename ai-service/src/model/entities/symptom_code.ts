import { Column, OneToMany, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { RiskLevel } from "../../types/enum.types"
import { ScoringRule } from "./scoring_rule"
import { ResponseSymptom } from "./response_symptom"
import { SymptomSpecialty } from "./symptom_specialty"


export class SymptomCode {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    code!: string //short unique code like SYM-042, used in the AI's symptom_codes array

    @Column()
    icd10_ref!: string // code used to classify medical diagnoses

    @Column()
    description!: string //human-readable label of the symptom

     @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    })
    default_weight!: string //the base numeric weight applied in weighted scoring

    @Column({type: 'enum', enum: RiskLevel})
    severity_class!: string

    @OneToMany(() => ScoringRule, scoring => scoring.symptom_code)
    scoring!: ScoringRule []

    @OneToMany(() => ResponseSymptom, (response_symptom) => response_symptom.symptom_code)
    response_symptom!: SymptomCode []
    
    @ManyToOne(() => SymptomSpecialty, (symptom_specialty) => symptom_specialty.symptom_code)
    symptom_specialty!: SymptomSpecialty
    
}