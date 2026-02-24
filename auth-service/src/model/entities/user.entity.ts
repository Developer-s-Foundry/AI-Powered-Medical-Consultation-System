import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base";
import { Role } from "./roles.entity";
import { ResetPasswordToken } from "./reset-password-token.entity";
import { RefreshToken } from "./refresh-token.entity";
import { EmailVerificationToken } from "./email-verification-token.entity";

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isVerified!: boolean;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @OneToMany(() => ResetPasswordToken, (token) => token.user)
  resetPasswordTokens!: ResetPasswordToken[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => EmailVerificationToken, (token) => token.user)
  emailVerificationTokens!: EmailVerificationToken[];
}
