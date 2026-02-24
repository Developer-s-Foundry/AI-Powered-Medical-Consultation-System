import { UserRepository } from "../repository/user.repository";
import EventPublisher from "./EventPublisher";
import jwt from "jsonwebtoken";

class UserService {
  private userRepository: UserRepository;
  private eventPublisher: EventPublisher;

  constructor() {
    this.userRepository = new UserRepository();
    this.eventPublisher = new EventPublisher();
  }

  public async createUser(email: string, password: string) {
    // Create user - returns User entity directly
    const user = await this.userRepository.createUser(email, password);

    // Publish event
    await this.eventPublisher.publishUserCreated({
      userId: user.id,
      email: user.email,
      role: user.role?.name || "patient",
    });

    // Generate token immediately after registration
    const accessToken = this.generateAccessToken(user);

    //Return user WITHOUT password
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isVerified: user.isVerified,
      role: user.role ? user.role.name : "patient",
      createdAt: user.createdAt,
      accessToken,
    };
  }

  public async loginUser(email: string, password: string) {
    const user = await this.userRepository.loginUser(email, password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified,
        role: user.role ? user.role.name : "patient",
      },
      accessToken,
    };
  }

  // Generate JWT token
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role?.name || "patient",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );
  }

  public async verifyEmail(email: string, token: string) {
    // Verify email
    const result = await this.userRepository.verifyEmail(email, token);

    // Get user to publish event
    const user = await this.userRepository.findByEmail(email);

    if (user) {
      await this.eventPublisher.publishEmailVerified({
        userId: user.id,
        email: user.email,
        role: user.role?.name || "patient",
      });
    }

    return result;
  }

  public async findById(id: string) {
    return await this.userRepository.findById(id);
  }

  public async delete(id: string) {
    // Delete user
    await this.userRepository.delete(id);

    // Publish event
    await this.eventPublisher.publishUserDeleted(id);
  }

  public async resetPassword(
    email: string,
    newPassword: string,
    token: string,
  ) {
    await this.userRepository.resetPassword(email, newPassword, token);
  }

  public async forgotPassword(email: string) {
    await this.userRepository.forgotPassword(email);
  }

  public async initiateEmailVerification(email: string) {
    await this.userRepository.initiateEmailVerification(email);
  }
}

export default UserService;
