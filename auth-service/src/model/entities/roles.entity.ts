import { Column, OneToMany } from "typeorm";
import { User } from "./user.entity";


export class Role {
    @Column()
    name!: string;

    @OneToMany(() => User, user => user.role)
    users!: User[];
}
