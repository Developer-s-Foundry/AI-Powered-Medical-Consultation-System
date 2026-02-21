import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { PharmacyProfileAttributes } from "../@types/pharmacy.types";

@Table({
  tableName: "pharmacy_profiles",
  timestamps: true,
  underscored: true,
})
export class PharmacyProfile extends Model<PharmacyProfileAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    field: "user_id",
  })
  userId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: "pharmacy_name",
  })
  pharmacyName!: string;

  @Column({
    type: DataType.STRING(20),
    field: "phone",
  })
  phone?: string;

  @Column({
    type: DataType.STRING(100),
    field: "lincense_number",
  })
  lincenseNumber?: string;

  @Column({
    type: DataType.JSONB,
    field: "address",
  })
  address?: any;

  @Column({
    type: DataType.JSONB,
    field: "operation_days",
  })
  operationDays?: any;

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
