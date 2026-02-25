import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { SymptomCode } from "./symptom_code"
import { RiskLevel } from "../types/enum.types"


export class Scoring {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    rule_name!: string // a label describing what this rule does

    @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    })
    weight_multiplier!: string //a decimal multiplier applied on top of the symptom's default_weight

    @Column({type: 'enum', enum: RiskLevel})
    applies_to_risk!: string

    @Column()
    effective_from!: Date // date from which this rule version is valid, allowing rule versioning over time

    @ManyToOne(() => SymptomCode, symptom_code => symptom_code.scoring)
    symptom_code!: SymptomCode
}