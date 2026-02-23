import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class EmailVerificationToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token_hash!: string;

  @Column()
  expiresAt!: Date;

  @ManyToOne(() => User, (user) => user.emailVerificationTokens)
  user!: User;
}
