import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class WebhookEvent {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    payment_reference_id!: string

    @Column({type: "jsonb"})
    payload!: any

    @Column({default: false})
    processed!: boolean

    @CreateDateColumn()
    received_at!: Date
}