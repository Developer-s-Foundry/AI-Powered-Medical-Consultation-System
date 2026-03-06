import { PaymentStatus } from "../../types/enum.types"
import { Entity, Column, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Session } from "./session"
import { AppointmentStatus } from "../../types/enum.types";



@Entity()
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    patient_id!: string

    @Column()
    doctor_id!: string

    @Column({ type: "timestamp" })
    appointment_date!: Date

    @Column({type: 'time'})
    appointment_time!: string

    @Column({type: 'enum', 
        enum: PaymentStatus, 
        default: PaymentStatus.PENDING })
    payment_status!: PaymentStatus

    @Column({
        type: "enum",
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING
    })
    status!: AppointmentStatus; // after payment appointment status changes to confirmed

    @Column()
    reason!: string

    @Column()
    cancellation_reason!: string

    @Column({default: false})
    reminder_sent!: boolean

    @CreateDateColumn()
    created_at!: Date

    @UpdateDateColumn()
    updated_at!: Date

    @OneToOne(() => Session, session => session.appointment)
    session!: Session
}