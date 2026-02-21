import UserService from "../model/service/user_service";
import { Controller, Post, Route, Get, Body, Path} from "tsoa";

@Route("users")
class UserController extends Controller {
    private userService: UserService;

    constructor() {
        super();
        this.userService = new UserService();
    }

    @Post("/register")
    public async createUser(
        @Body() requestBody: { email: string; password: string }
        ) {
        const { email, password } = requestBody;
        return await this.userService.createUser(email, password);
    }

    @Post("/login")
    public async loginUser(
        @Body() requestBody: { email: string; password: string }
    ) {
        const { email, password } = requestBody;
        return await this.userService.loginUser(email, password);
    }

    @Post("/verify-email")
    public async verifyEmail(
        @Body() requestBody: { email: string; token: string }
    ) {
        const { email, token } = requestBody;
        return await this.userService.verifyEmail(email, token);
    }

    @Get("/{id}")
    public async findById(
       @Path() id: string  
    ) {
        return await this.userService.findById(id);
    }

    @Get("/delete/{id}")
    public async delete(
        @Path() id: string
    ) {
        await this.userService.delete(id);
    }

    @Post("/reset-password")
    public async resetPassword(
        @Body() requestBody: { email: string; newPassword: string; token: string }
    ) {
        const { email, newPassword, token } = requestBody;
        await this.userService.resetPassword(email, newPassword, token);
    }

    @Post("/forgot-password")
    public async forgotPassword(
        @Body() requestBody: { email: string }
    ) {
        const { email } = requestBody;
        await this.userService.forgotPassword(email);
    }

    @Post("/initiate-email-verification")
    public async initiateEmailVerification(
        @Body() requestBody: { email: string }
    ) {
        const { email } = requestBody;
        await this.userService.initiateEmailVerification(email);
    }
}

export default UserController;