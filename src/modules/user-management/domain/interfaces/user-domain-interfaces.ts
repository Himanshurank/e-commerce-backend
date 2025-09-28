import { UserEntity } from "../entities/user-entity";
import { SellerProfileEntity } from "../entities/seller-profile-entity";

export interface UserDomainService {
  // Core authentication methods (currently used)
  validateUserRegistration(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void>;

  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;

  // Email verification (placeholder for future implementation)
  generateEmailVerificationToken(userId: string): Promise<string>;
}

// TODO: Add UserEmailService interface when implementing email functionality
