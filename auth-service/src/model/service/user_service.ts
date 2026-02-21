import { UserRepository } from "../repository/user.repository";


class UserService {

    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async createUser(email: string, password: string) {
        return await this.userRepository.createUser(email, password);
    }

    public async loginUser(email: string, password: string) {
        return await this.userRepository.loginUser(email, password);
    }

    public async verifyEmail(email: string, token: string) {
        return await this.userRepository.verifyEmail(email, token);
    }       

    public async findById(id: string) {
        return await this.userRepository.findById(id);
    }
    public async delete(id: string) {
        await this.userRepository.delete(id);
    }
    public async resetPassword(email: string, newPassword: string, token: string) {
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