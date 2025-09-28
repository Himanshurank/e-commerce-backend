import { UserDomainService } from "../interfaces/user-domain-interfaces";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserValidationService implements UserDomainService {
  private readonly saltRounds = 12;
  private readonly jwtSecret = process.env["JWT_SECRET"] || "your-secret-key";

  async validateUserRegistration(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    // Email validation
    if (!this.isValidEmail(userData.email)) {
      throw new Error("Invalid email format");
    }

    // Password validation
    if (!this.isValidPassword(userData.password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
      );
    }

    // Name validation
    if (!userData.firstName.trim() || userData.firstName.length < 2) {
      throw new Error("First name must be at least 2 characters long");
    }

    if (!userData.lastName.trim() || userData.lastName.length < 2) {
      throw new Error("Last name must be at least 2 characters long");
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
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
