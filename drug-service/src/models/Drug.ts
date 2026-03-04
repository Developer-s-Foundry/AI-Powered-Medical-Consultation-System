import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { DrugAttributes } from "../@types/drug.types";

@Table({
  tableName: "drugs",
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ["pharmacy_id"], name: "drugs_pharmacy_id" },
    { fields: ["medicine_name"], name: "drugs_medicine_name" },
    { fields: ["manufacturer"], name: "drugs_manufacturer" },
    { fields: ["requires_prescription"], name: "drugs_requires_prescription" },
  ],
})
export class Drug extends Model<DrugAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "pharmacy_id",
  })
  pharmacyId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: "medicine_name",
  })
  medicineName!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  dosage!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  manufacturer!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "expiry_date",
  })
  expiryDate!: Date;

  @Column({
    type: DataType.TEXT,
    field: "description",
  })
  description?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: "requires_prescription",
  })
  requiresPrescription!: boolean;

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
