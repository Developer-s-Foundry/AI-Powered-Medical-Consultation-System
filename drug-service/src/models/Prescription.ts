import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import {
  PrescriptionAttributes,
  PrescriptionStatus,
} from "../@types/prescription.types";
import { PrescriptionItem } from "./PrescriptionItem";

@Table({
  tableName: "prescriptions",
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ["doctor_id"], name: "prescriptions_doctor_id" },
    { fields: ["appointment_id"], name: "prescriptions_appointment_id" },
    { fields: ["patient_id"], name: "prescriptions_patient_id" },
    { fields: ["status"], name: "prescriptions_status" },
  ],
})
export class Prescription extends Model<PrescriptionAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "doctor_id",
  })
  doctorId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "appointment_id",
  })
  appointmentId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "patient_id",
  })
  patientId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  diagnosis!: string;

  @Column({
    type: DataType.TEXT,
  })
  instructions?: string;

  @Column({
    type: DataType.TEXT,
  })
  notes?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: PrescriptionStatus.ACTIVE,
  })
  status!: PrescriptionStatus;

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

  @HasMany(() => PrescriptionItem)
  items!: PrescriptionItem[];
}
