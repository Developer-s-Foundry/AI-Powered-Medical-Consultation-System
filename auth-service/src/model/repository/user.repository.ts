import { ResetPasswordToken } from '../entities/reset-password-token.entity';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import AppDataSource from "../../config/database";
import { User } from "../entities/user.entity";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/error";
import crypto from "crypto";
import Producer from '../../producer/producer';
import { RabbitMQConfig } from '../../config/rabbitmq';
import { EventTypes, RecipientType} from '../../types/event.types';
import { SelectQueryBuilder } from 'typeorm';
import { BaseResponse } from '../../utils/reusable.func';
import { ResponseData } from '../../types/entity.types';




export class UserRepository {
    private userRepository = AppDataSource.getRepository(User);
    private resetPasswordRepository = AppDataSource.getRepository(ResetPasswordToken);
    private tokenExpirationTime = 60 * 60 * 1000; // 1 hour
    private EmailVerificationTokenRepository = AppDataSource.getRepository(EmailVerificationToken);
    private producer = new Producer(new RabbitMQConfig())

   public async createUser(email:string, password: string): Promise<User> {
        const hash_password = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            email,
            password: hash_password
        });
        return await this.save(user);
    }

    public async loginUser(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }   

     public async findById(id: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    public async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    public async delete(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }

    public async resetPassword(email: string, newPassword: string, token:string): Promise<void> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        const tokenHash = this.generateHashToken(token).hash;

        const userResetTokenData = await this.getUserTokenData(user.id, tokenHash, 'ResetPasswordToken').getOne();
        if (!userResetTokenData || userResetTokenData.token_hash !== tokenHash) {
            throw new AppError("Invalid or expired token", 400);
        }

        const hash_password = await bcrypt.hash(newPassword, 10);
        user.password = hash_password;
        await this.save(user);
;
        userResetTokenData.isUsed = true;
        await this.resetPasswordRepository.save(userResetTokenData);      
       
    }
    private getUserTokenData(userId: string, tokenHash: string, entity: string): SelectQueryBuilder<ResetPasswordToken> {
        return  this.resetPasswordRepository.createQueryBuilder(entity)
        .where(`${entity}.userId = :userId`, { userId })
        .andWhere(`${entity}.token_hash = :tokenHash`, { tokenHash })
        .andWhere(`${entity}.isUsed = false`)
        .andWhere(`${entity}.expiresAt > NOW()`)
    }

    private generateHashToken(resetToken: string): { resetToken: string, hash: string } {
        const hash = crypto
        .createHash("sha256")
        .update(resetToken).digest("hex");
        return {
            resetToken,
            hash
        }
    }  

    public async forgotPassword(email: string): Promise<void> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new AppError("User not found", 404);
        }
         const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = this.generateHashToken(resetToken).hash;
        const expiresAt = new Date(Date.now() + this.tokenExpirationTime);
        const resetTokenEntity = this.resetPasswordRepository.create({
            token_hash: hash,
            expiresAt,
            user
        });
        await this.resetPasswordRepository.save(resetTokenEntity);

        // send to notification service to send email to user with resetToken
        const data = {
            eventType: EventTypes.password_reset,
            recipientId: user.id,
            recipientType: user.role.name === 'doctor' ? RecipientType.doctor : RecipientType.patient,
            referenceType: "user",
            referenceId: user.id,
            email: user.email,
            resetToken
        }
        this.producer.sendToQueue(EventTypes.password_reset, data)
    }

    public async initiateEmailVerification(email: string): Promise<void> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + this.tokenExpirationTime);
        const tokenEntity = this.EmailVerificationTokenRepository.create({
            token_hash: this.generateHashToken(verificationToken).hash,
            expiresAt,
            user
        });
        await this.EmailVerificationTokenRepository.save(tokenEntity);

        // send to notification service to send email to user with verificationToken
        const data = {
            eventType: EventTypes.email_verification,
            recipientId: user.id,
            recipientType: user.role.name === 'doctor' ? RecipientType.doctor : RecipientType.patient,
            referenceType: "user",
            referenceId: user.id, 
            email: user.email,
            verificationToken
        }
        this.producer.sendToQueue(EventTypes.email_verification, data)
    }

    public async verifyEmail(email: string, token: string): Promise<ResponseData> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        const tokenHash = this.generateHashToken(token).hash;
        const userTokenData = await this.getUserTokenData(user.id, tokenHash, 'EmailVerificationToken').getOne();
        if (!userTokenData || userTokenData.token_hash !== tokenHash) {
            throw new AppError("Invalid or expired token", 400);
        }
        user.isVerified = true;
        await this.save(user);
        const response = new BaseResponse(200, "Email verified successfully");
        return response;
    }      
    private async save(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }
}