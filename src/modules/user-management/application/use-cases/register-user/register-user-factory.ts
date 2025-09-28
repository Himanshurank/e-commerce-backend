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

    // Create use case (email service removed for now)
    const useCase = new RegisterUserUseCase(userRepository, userDomainService);

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
