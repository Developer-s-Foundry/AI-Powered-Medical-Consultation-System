import {Entity, Column, ManyToOne, JoinColumn} from "typeorm";
import { BaseEntity } from "./base";
import { payment_status } from "../../types/enum.types";
import { Payment } from "./payment.entity";

@Entity("transaction")
export class Transaction extends BaseEntity {

    @Column()
    payment_reference_id!: string  

    @Column()
    amount!: number

    @Column({type: "enum", enumName: "payment_status_enum", enum: payment_status, default: payment_status.PENDING})
    status!: string

    @Column({type: "jsonb"})
    response_payload!: any

    @ManyToOne(() => Payment, (payment) => payment.transactions)
    payment!: Payment
}