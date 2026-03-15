import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SymptomSpecialty } from "./symptom_specialty";
@Entity()
export class Specialty {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(
    () => SymptomSpecialty,
    (symptom_specialty) => symptom_specialty.specialty,
  )
  symptom_specialty!: SymptomSpecialty;
}
