import { RegisterUserUseCase } from "./register-user-use-case";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user-repository-impl";
import { UserValidationService } from "../../../domain/services/user-validation-service";
import { DatabaseService } from "../../../../../shared/infrastructure/services/databaseService";
import { DatabaseFactory } from "../../../../../shared/factories/databaseFactory";

export class RegisterUserFactory {
  static async create(req: any): Promise<{
    useCase: RegisterUserUseCase;
    loggerService: any; // Will be replaced with actual logger service
  }> {
    // Create database service
    const databaseService = DatabaseFactory.create();

    // Create repository
    const userRepository = new UserRepositoryImpl(databaseService);

    // Create domain service
    const userDomainService = new UserValidationService();

    // Create email service (placeholder - will be implemented later)
    const userEmailService = {
      async sendWelcomeEmail(user: any): Promise<void> {
        console.log(`Sending welcome email to: ${user.getEmail()}`);
        // TODO: Implement actual email service
      },
      async sendEmailVerification(user: any, token: string): Promise<void> {
        console.log(
          `Sending email verification to: ${user.getEmail()} with token: ${token}`
        );
        // TODO: Implement actual email service
      },
      async sendPasswordResetEmail(user: any, token: string): Promise<void> {
        console.log(`Sending password reset email to: ${user.getEmail()}`);
        // TODO: Implement actual email service
      },
      async sendSellerApprovalNotification(
        user: any,
        sellerProfile: any
      ): Promise<void> {
        console.log(
          `Sending seller approval notification to: ${user.getEmail()}`
        );
        // TODO: Implement actual email service
      },
    };

    // Create use case
    const useCase = new RegisterUserUseCase(
      userRepository,
      userDomainService,
      userEmailService
    );

    // Create logger service (placeholder)
    const loggerService = {
      errorLog: (data: any) => {
        console.error("Error:", data);
        // TODO: Implement actual logging service
      },
      infoLog: (data: any) => {
        console.log("Info:", data);
        // TODO: Implement actual logging service
      },
    };

    return { useCase, loggerService };
  }
}
