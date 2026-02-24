import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token_hash!: string;

  @Column({ default: false })
  isUsed!: boolean;

  @Column()
  expiresAt!: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user!: User;
}
