import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { payment_status } from "../../types/enum.types";
import { BaseEntity } from "./base";
import { Provider } from "./provider.entity";
import { Transaction } from "./transaction.entity";


@Entity()
 export class Payment extends BaseEntity {

    @Column()
    booking_id!: string

    @Column()
    patient_id!: string

    @Column()
    payment_reference_id!: string

    @Column()
    amount!: number

    @Column({default: 'NGN'})
    currency!: string

    @Column({ 
        type: "enum",
        enumName: "payment_status_enum",
        enum: payment_status,
        default: payment_status.PENDING
    })
    status!: payment_status

    @Column()
    idempotency_key!: string

    @Column()
    retry_count!: number

    @Column()
    last_retry_at!: Date

    @Column()
    next_retry!: number

    @ManyToOne(() => Provider, provider => provider.payments)
    provider!: Provider

    @OneToMany(() => Transaction, transaction => transaction.payment)
    @JoinColumn()
    transactions!: Transaction[]
}
