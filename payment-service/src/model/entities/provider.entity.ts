import { Column, Entity, OneToMany} from "typeorm";
import { BaseEntity } from "./base";
import { Payment } from "./payment.entity";


@Entity("provider")
export class Provider extends BaseEntity {

    @Column()
    provider_name!: string

    @Column({default: false})
    is_active!: boolean

    @OneToMany(() => Payment, payment => payment.provider)
    payments!: Payment[]
}