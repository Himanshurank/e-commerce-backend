import { UserDomainService } from "../interfaces/user-domain-interfaces";
import { ILoggerService } from "../../../../shared/interfaces/logger-service-interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserValidationService implements UserDomainService {
  private readonly saltRounds = 12;
  private readonly jwtSecret = process.env["JWT_SECRET"] || "your-secret-key";

  constructor(private readonly logger?: ILoggerService) {}

  async validateUserRegistration(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    this.logger?.debug("Validating user registration data", {
      email: userData.email,
    });

    // Email validation
    if (!this.isValidEmail(userData.email)) {
      this.logger?.warn("Invalid email format during registration", {
        email: userData.email,
      });
      throw new Error("Invalid email format");
    }

    // Password validation
    if (!this.isValidPassword(userData.password)) {
      this.logger?.warn("Weak password during registration", {
        email: userData.email,
      });
      throw new Error(
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
      );
    }

    // Name validation
    if (!userData.firstName.trim() || userData.firstName.length < 2) {
      this.logger?.warn("Invalid first name during registration", {
        email: userData.email,
      });
      throw new Error("First name must be at least 2 characters long");
    }

    if (!userData.lastName.trim() || userData.lastName.length < 2) {
      this.logger?.warn("Invalid last name during registration", {
        email: userData.email,
      });
      throw new Error("Last name must be at least 2 characters long");
    }

    this.logger?.debug("User registration validation passed", {
      email: userData.email,
    });
  }

  async hashPassword(password: string): Promise<string> {
    this.logger?.debug("Hashing password");
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    this.logger?.debug("Password hashed successfully");
    return hashedPassword;
  }

  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    this.logger?.debug("Verifying password");
    const isValid = await bcrypt.compare(password, hashedPassword);
    this.logger?.debug("Password verification completed", { isValid });
    return isValid;
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    return jwt.sign(
      {
        userId,
        type: "email_verification",
        timestamp: Date.now(),
      },
      this.jwtSecret,
      { expiresIn: "24h" }
    );
  }

  // Removed verifyEmailToken - not currently used

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}
