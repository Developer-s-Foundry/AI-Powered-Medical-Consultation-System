import { OneToMany, PrimaryGeneratedColumn, Column} from "typeorm";
import { SymptomCode } from "./symptom_code";
import { Specialty } from "./specialty";

export class SymptomSpecialty {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type: 'int'})
    priority!: number

    @OneToMany(() => SymptomCode, (symptom_code) => symptom_code.symptom_specialty)
    symptom_code!: SymptomCode

    @OneToMany(() => Specialty, (specialty) => specialty.symptom_specialty)
    specialty!: Specialty    
    
}