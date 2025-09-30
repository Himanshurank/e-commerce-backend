import { IUserRepository } from "../../../infrastructure/repositories/userRepoImpl";
import { User } from "../../../domain/entities/auth/user";
import { SignupRequestDto } from "../../Dto/auth/signupRequest";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class SignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(params: SignupRequestDto): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(params.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(params.password, saltRounds);

      // Create user
      const user = await this.userRepository.create({
        email: params.email,
        password: hashedPassword,
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone,
        role: params.role,
      });

      this.logger.info("User created successfully", {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return user;
    } catch (error: any) {
      this.logger.error("User signup failed", {
        email: params.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
