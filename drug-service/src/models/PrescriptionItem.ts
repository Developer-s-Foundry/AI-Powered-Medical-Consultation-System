import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { PrescriptionItemAttributes } from "../@types/prescription.types";
import { Prescription } from "./Prescription";
import { Drug } from "./Drug";

@Table({
  tableName: "prescription_items",
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ["prescription_id"], name: "prescription_items_prescription_id" },
    { fields: ["drug_id"], name: "prescription_items_drug_id" },
  ],
})
export class PrescriptionItem extends Model<PrescriptionItemAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Prescription)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "prescription_id",
  })
  prescriptionId!: string;

  @ForeignKey(() => Drug)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "drug_id",
  })
  drugId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  dosage!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  duration!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "quantity_prescribed",
  })
  quantityPrescribed!: number;

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

  @BelongsTo(() => Prescription)
  prescription!: Prescription;

  @BelongsTo(() => Drug)
  drug!: Drug;
}
