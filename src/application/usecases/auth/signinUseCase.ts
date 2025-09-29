import { ISigninUseCase } from "../../../domain/interfaces/application/usecases/signinUseCase";
import { IUserRepository } from "../../../domain/interfaces/infrastructure/repositories/userRepository";
import { User } from "../../../domain/entities/auth/user";
import { SigninRequestDto } from "../../Dto/auth/signinRequest";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";
import { UserStatus } from "../../../domain/enum/userStatus";
import bcrypt from "bcrypt";

export class SigninUseCase implements ISigninUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(
    params: SigninRequestDto
  ): Promise<{ user: User; token?: string }> {
    try {
      this.logger.info("User signin attempt", {
        email: params.email,
      });

      // Find user by email
      const user = await this.userRepository.findByEmail(params.email);
      if (!user) {
        this.logger.warn("Signin failed - user not found", {
          email: params.email,
        });
        throw new Error("Invalid email or password");
      }

      // Check if user account is approved
      if (user.status !== UserStatus.APPROVED) {
        this.logger.warn("Signin failed - account not approved", {
          email: params.email,
          status: user.status,
        });
        throw new Error("Account is not approved. Please contact support.");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        params.password,
        user.password
      );
      if (!isPasswordValid) {
        this.logger.warn("Signin failed - invalid password", {
          email: params.email,
          userId: user.id,
        });
        throw new Error("Invalid email or password");
      }

      // Update last login timestamp (optional - you can implement this later)
      // await this.userRepository.updateLastLogin(user.id);

      this.logger.info("User signin successful", {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // TODO: Generate JWT token here when implementing authentication
      // For now, returning without token
      return { user };
    } catch (error: any) {
      this.logger.error("User signin failed", {
        email: params.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
