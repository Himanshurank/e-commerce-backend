import { LoginUserRequestDto } from "./login-user-request-dto";
import { LoginUserResponseDto } from "./login-user-response-dto";
import { UserRepositoryInterface } from "../../../repositories/user-repository-interface";
import { UserDomainService } from "../../../domain/interfaces/user-domain-interfaces";
import { UserMapper } from "../../../mappers/user-mapper";
import { SellerProfileMapper } from "../../../mappers/seller-profile-mapper";
import { USER_CONSTANTS } from "../../constants/user-constants";
import { ILoggerService } from "../../../../../shared/interfaces/logger-service-interface";
import jwt from "jsonwebtoken";

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userDomainService: UserDomainService,
    private logger?: ILoggerService
  ) {}

  async execute(request: LoginUserRequestDto): Promise<LoginUserResponseDto> {
    this.logger?.info("Starting user login", { email: request.email });

    try {
      // 1. Validate input
      this.validateRequest(request);
      this.logger?.info("Login validation passed", { email: request.email });

      // 2. Find user by email
      const user = await this.userRepository.getUserByEmail(request.email);
      if (!user) {
        this.logger?.warn("Login failed - user not found", {
          email: request.email,
        });
        throw new Error(USER_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
      }

      // 3. Verify password
      const isPasswordValid = await this.userDomainService.verifyPassword(
        request.password,
        user.getPasswordHash()
      );

      if (!isPasswordValid) {
        this.logger?.warn("Login failed - invalid password", {
          email: request.email,
          userId: user.getId(),
        });
        throw new Error(USER_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
      }

      // 4. Check if user can login
      if (!user.canLogin()) {
        if (!user.isEmailVerified()) {
          throw new Error(USER_CONSTANTS.ERRORS.EMAIL_NOT_VERIFIED);
        }
        if (!user.isActive()) {
          throw new Error(USER_CONSTANTS.ERRORS.ACCOUNT_SUSPENDED);
        }
      }

      // 5. Generate tokens
      const token = this.generateAccessToken(
        user.getId(),
        user.getEmail(),
        user.getRole()
      );
      const refreshToken = request.rememberMe
        ? this.generateRefreshToken(user.getId())
        : undefined;

      // 6. Get seller profile if user is a seller
      let sellerProfileData = undefined;
      if (user.isSeller()) {
        const sellerProfile =
          await this.userRepository.getSellerProfileByUserId(user.getId());
        if (sellerProfile) {
          sellerProfileData = {
            id: sellerProfile.getId(),
            businessName: sellerProfile.getBusinessName(),
            isVerified: sellerProfile.isBusinessVerified(),
            canReceivePayouts: sellerProfile.canReceivePayouts(),
            hasCompleteProfile: sellerProfile.hasCompleteProfile(),
          };
        }
      }

      // 7. Build response
      const userProfile = UserMapper.toProfileResponseDto(user);

      const response = {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          fullName: userProfile.fullName,
          role: userProfile.role,
          status: userProfile.status,
          emailVerified: userProfile.emailVerified,
          phoneNumber: userProfile.phoneNumber,
          canLogin: userProfile.canLogin,
          canSellProducts: userProfile.canSellProducts,
          canAccessAdminPanel: userProfile.canAccessAdminPanel,
          needsApproval: userProfile.needsApproval,
        },
        token,
        refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours
        sellerProfile: sellerProfileData,
        message: USER_CONSTANTS.SUCCESS.LOGIN_SUCCESSFUL,
      };

      this.logger?.info("User login successful", {
        userId: user.getId(),
        email: user.getEmail(),
        role: user.getRole(),
      });

      this.logger?.logBusinessEvent("user_login", {
        userId: user.getId(),
        email: user.getEmail(),
        role: user.getRole(),
        rememberMe: request.rememberMe,
      });

      return response;
    } catch (error) {
      this.logger?.error("User login failed", error as Error);
      throw error;
    }
  }

  private validateRequest(request: LoginUserRequestDto): void {
    const errors: string[] = [];

    if (!request.email || request.email.trim().length === 0) {
      errors.push("Email is required");
    }

    if (!request.password || request.password.length === 0) {
      errors.push("Password is required");
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string
  ): string {
    const payload = {
      userId,
      email,
      role,
      type: "access_token",
      timestamp: Date.now(),
    };

    return jwt.sign(payload, process.env["JWT_SECRET"] || "your-secret-key", {
      expiresIn: USER_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      type: "refresh_token",
      timestamp: Date.now(),
    };

    return jwt.sign(
      payload,
      process.env["JWT_REFRESH_SECRET"] || "your-refresh-secret-key",
      { expiresIn: USER_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRY }
    );
  }
}
