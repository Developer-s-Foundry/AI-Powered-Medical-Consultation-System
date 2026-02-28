import UserService from "../model/service/user_service";
import { Controller, Post, Route, Get, Body, Path } from "tsoa";

@Route("users")
export class UserController extends Controller {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  @Post("/register")
  public async createUser(
    @Body() requestBody: { email: string; password: string; role: string },
  ) {
    const { email, password, role } = requestBody;

    // 1. Create the user
    const user = await this.userService.createUser(email, password, role);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken: user.accessToken,
    };
  }

  @Post("/login")
  public async loginUser(
    @Body() requestBody: { email: string; password: string },
  ) {
    console.log("LOGIN BODY RECEIVED:", requestBody);
    const { email, password } = requestBody;
    const res = await this.userService.loginUser(email, password);

    return {
      user: {
        id: res.user.id,
        email: res.user.email,
        isActive: res.user.isActive,
        isVerified: res.user.isVerified,
        role: res.user.role, // role comes from DB, not from client
      },
      accessToken: res.accessToken,
    };
  }

  @Post("/verify-email")
  public async verifyEmail(
    @Body() requestBody: { email: string; token: string },
  ) {
    const { email, token } = requestBody;
    return await this.userService.verifyEmail(email, token);
  }

  @Get("/{id}")
  public async findById(@Path() id: string) {
    return await this.userService.findById(id);
  }

  @Get("/delete/{id}")
  public async delete(@Path() id: string) {
    await this.userService.delete(id);
  }

  @Post("/reset-password")
  public async resetPassword(
    @Body() requestBody: { email: string; newPassword: string; token: string },
  ) {
    const { email, newPassword, token } = requestBody;
    await this.userService.resetPassword(email, newPassword, token);
  }

  @Post("/forgot-password")
  public async forgotPassword(@Body() requestBody: { email: string }) {
    const { email } = requestBody;
    await this.userService.forgotPassword(email);
  }

  @Post("/initiate-email-verification")
  public async initiateEmailVerification(
    @Body() requestBody: { email: string },
  ) {
    const { email } = requestBody;
    await this.userService.initiateEmailVerification(email);
  }
}
