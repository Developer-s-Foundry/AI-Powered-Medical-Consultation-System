import { Column, ManyToOne } from "typeorm";
import { User } from "./user.entity";


export class EmailVerificationToken {

    @Column()
    token_hash!: string;

    @Column()
    expiresAt!: Date;

    @ManyToOne(() => User, user => user.emailVerificationTokens)
    user!: User;
    
}