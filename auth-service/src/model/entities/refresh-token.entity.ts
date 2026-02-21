import { Column, ManyToOne } from "typeorm";
import { User } from "./user.entity";


export class RefreshToken {

    @Column()
    token_hash!: string;

    @Column({ default: false })
    isUsed!: boolean;

    @Column()
    expiresAt!: Date;

    @ManyToOne(() => User, user => user.refreshTokens)
    user!: User;
    
}