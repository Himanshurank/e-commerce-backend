import { RegisterUserRequestDto } from "./register-user-request-dto";
import { RegisterUserResponseDto } from "./register-user-response-dto";
import { UserRepositoryInterface } from "../../../repositories/user-repository-interface";
import { UserDomainService } from "../../../domain/interfaces/user-domain-interfaces";
import { UserMapper } from "../../../mappers/user-mapper";
import { UserRole } from "../../../domain/entities/user-entity";
import { USER_CONSTANTS } from "../../constants/user-constants";
import { ILoggerService } from "../../../../../shared/interfaces/logger-service-interface";
import jwt from "jsonwebtoken";

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userDomainService: UserDomainService,
    private logger?: ILoggerService
  ) {}

  async execute(
    request: RegisterUserRequestDto
  ): Promise<RegisterUserResponseDto> {
    this.logger?.info("Starting user registration", { email: request.email });

    try {
      // 1. Validate input data
      await this.validateRequest(request);
      this.logger?.info("User registration validation passed", {
        email: request.email,
      });

      // 2. Check if user already exists
      const existingUser = await this.userRepository.getUserByEmail(
        request.email
      );
      if (existingUser) {
        this.logger?.warn("User registration failed - user already exists", {
          email: request.email,
        });
        throw new Error(USER_CONSTANTS.ERRORS.USER_ALREADY_EXISTS);
      }

      // 3. Validate user registration data using domain service
      await this.userDomainService.validateUserRegistration({
        email: request.email,
        password: request.password,
        firstName: request.firstName,
        lastName: request.lastName,
      });

      // 4. Hash password
      const passwordHash = await this.userDomainService.hashPassword(
        request.password
      );

      // 5. Create user entity
      const userData = UserMapper.fromCreateRequest(request);
      const userEntity = UserMapper.createUserEntity({
        ...userData,
        passwordHash,
      });

      // 6. Save user to repository
      const savedUser = await this.userRepository.createUser(userEntity);
      this.logger?.info("User created successfully", {
        userId: savedUser.getId(),
        email: savedUser.getEmail(),
      });

      // 7. Generate JWT token
      const token = this.generateAccessToken(
        savedUser.getId(),
        savedUser.getEmail(),
        savedUser.getRole()
      );

      // 8. Generate email verification token (email sending to be implemented later)
      const emailVerificationToken =
        await this.userDomainService.generateEmailVerificationToken(
          savedUser.getId()
        );
      // TODO: Implement email sending service

      // 9. Build response
      const userResponse = UserMapper.toResponseDto(savedUser);

      const response = {
        user: {
          id: userResponse.id,
          email: userResponse.email,
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
          fullName: userResponse.fullName,
          role: userResponse.role,
          status: userResponse.status,
          emailVerified: userResponse.emailVerified,
          phoneNumber: userResponse.phoneNumber,
          createdAt: userResponse.createdAt,
        },
        token,
        expiresIn: 24 * 60 * 60, // 24 hours
        emailVerificationRequired: !savedUser.isEmailVerified(),
        message: USER_CONSTANTS.SUCCESS.USER_CREATED,
      };

      this.logger?.logBusinessEvent("user_registered", {
        userId: savedUser.getId(),
        email: savedUser.getEmail(),
        role: savedUser.getRole(),
      });

      return response;
    } catch (error) {
      this.logger?.error("User registration failed", error as Error);
      throw error;
    }
  }

  private async validateRequest(
    request: RegisterUserRequestDto
  ): Promise<void> {
    const errors: string[] = [];

    // Email validation
    if (!request.email || request.email.trim().length === 0) {
      errors.push("Email is required");
    } else if (
      request.email.length > USER_CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH
    ) {
      errors.push(
        `Email must be less than ${USER_CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH} characters`
      );
    }

    // Password validation
    if (!request.password || request.password.length === 0) {
      errors.push("Password is required");
    }

    // First name validation
    if (!request.firstName || request.firstName.trim().length === 0) {
      errors.push("First name is required");
    } else if (
      request.firstName.trim().length <
      USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH
    ) {
      errors.push(
        `First name must be at least ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`
      );
    } else if (
      request.firstName.trim().length >
      USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH
    ) {
      errors.push(
        `First name must be less than ${USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`
      );
    }

    // Last name validation
    if (!request.lastName || request.lastName.trim().length === 0) {
      errors.push("Last name is required");
    } else if (
      request.lastName.trim().length < USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH
    ) {
      errors.push(
        `Last name must be at least ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`
      );
    } else if (
      request.lastName.trim().length > USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH
    ) {
      errors.push(
        `Last name must be less than ${USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`
      );
    }

    // Role validation
    if (
      request.role &&
      !Object.values(UserRole).includes(request.role as UserRole)
    ) {
      errors.push("Invalid user role");
    }

    // Phone number validation (optional)
    if (request.phoneNumber) {
      const phoneNumber = request.phoneNumber.replace(/\D/g, ""); // Remove non-digits
      if (
        phoneNumber.length < USER_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH ||
        phoneNumber.length > USER_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH
      ) {
        errors.push(
          `Phone number must be between ${USER_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH} and ${USER_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH} digits`
        );
      }
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
}
