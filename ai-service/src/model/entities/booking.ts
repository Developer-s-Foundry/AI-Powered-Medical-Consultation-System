import { Column, CreateDateColumn, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Appointment } from "./appointment"
import { PaymentStatus } from "../types/enum.types"
import { Session } from "./session"


export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    patient_id!: string

    @Column()
    doctor_id!: string

    @Column()
    amount!: number

    @Column({type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    payment_status!: string

    @CreateDateColumn()
    created_at!: Date

    @UpdateDateColumn()
    updated_at!: Date

    @OneToOne(() => Session, session => session.booking)
    @JoinColumn()
    session!: Session

    @OneToOne(() => Appointment, appointment => appointment.booking)
    @JoinColumn()
    appointment!: Appointment
}