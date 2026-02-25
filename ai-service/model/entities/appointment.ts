import { Entity, Column, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Booking } from "./booking";


export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    patient_id!: string

    @Column()
    doctor_id!: string

    @Column()
    appointment_date!: Date

    @Column()
    appointment_time!: Date

    @Column()
    duration_minutes!: Date

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

    @OneToOne(() => Booking, (booking) => booking.appointment)
    booking!: Booking
}