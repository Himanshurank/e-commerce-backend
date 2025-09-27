import { UserEntity } from "../entities/user-entity";
import { SellerProfileEntity } from "../entities/seller-profile-entity";

export interface UserDomainService {
  validateUserRegistration(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void>;

  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  generateEmailVerificationToken(userId: string): Promise<string>;
  verifyEmailToken(
    token: string
  ): Promise<{ userId: string; isValid: boolean }>;
}

export interface UserEmailService {
  sendWelcomeEmail(user: UserEntity): Promise<void>;
  sendEmailVerification(
    user: UserEntity,
    verificationToken: string
  ): Promise<void>;
  sendPasswordResetEmail(user: UserEntity, resetToken: string): Promise<void>;
  sendSellerApprovalNotification(
    user: UserEntity,
    sellerProfile: SellerProfileEntity
  ): Promise<void>;
}
