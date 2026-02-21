import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { DoctorProfileAttributes } from "../@types/doctor.types";

@Table({
  tableName: "doctor_profiles",
  timestamps: true,
  underscored: true,
})
export class DoctorProfile extends Model<DoctorProfileAttributes> {
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
    type: DataType.STRING(20),
    field: "gender",
  })
  gender?: string;

  @Column({
    type: DataType.STRING(100),
    field: "specialty",
  })
  specialty?: string;

  @Column({
    type: DataType.STRING(255),
    field: "hospital_name",
  })
  hospitalName?: string;

  @Column({
    type: DataType.JSONB,
    field: "address",
  })
  address?: any;

  @Column({
    type: DataType.JSONB,
    field: "consultation_schedule",
  })
  consultationSchedule?: any;

  @Column({
    type: DataType.JSONB,
    field: "payment_details",
  })
  paymentDetails?: any;

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
