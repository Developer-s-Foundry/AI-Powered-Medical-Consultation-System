import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { PatientProfileAttributes } from "../@types/patient.types";

@Table({
  tableName: "patient_profiles",
  timestamps: true,
  underscored: true,
})
export class PatientProfile extends Model<PatientProfileAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    field: "user_id",
  })
  userId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: "first_name",
  })
  firstName!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: "last_name",
  })
  lastName!: string;

  @Column({
    type: DataType.STRING(20),
    field: "phone",
  })
  phone?: string;

  @Column({
    type: DataType.DATE,
    field: "date_of_birth",
  })
  dateOfBirth?: Date;

  @Column({
    type: DataType.STRING(20),
    field: "gender",
  })
  gender?: string;

  @Column({
    type: DataType.JSONB,
    field: "address",
  })
  address?: any;

  @Column({
    type: DataType.JSONB,
    field: "medical_history",
  })
  medicalHistory?: any;

  @Column({
    type: DataType.JSONB,
    field: "current_medications",
  })
  currentMedications?: any;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "created_at",
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updated_at",
  })
  updatedAt!: Date;
}
