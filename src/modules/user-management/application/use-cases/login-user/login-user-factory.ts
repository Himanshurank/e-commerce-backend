import { LoginUserUseCase } from "./login-user-use-case";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user-repository-impl";
import { UserValidationService } from "../../../domain/services/user-validation-service";
import { DatabaseFactory } from "../../../../../shared/factories/databaseFactory";

export class LoginUserFactory {
  static async create(req: any): Promise<{
    useCase: LoginUserUseCase;
    loggerService: any;
  }> {
    // Create database service
    const databaseService = DatabaseFactory.create();

    // Create repository
    const userRepository = new UserRepositoryImpl(databaseService);

    // Create domain service
    const userDomainService = new UserValidationService();

    // Create use case
    const useCase = new LoginUserUseCase(userRepository, userDomainService);

    // Create logger service (placeholder)
    const loggerService = {
      errorLog: (data: any) => {
        console.error("Login Error:", data);
        // TODO: Implement actual logging service
      },
      infoLog: (data: any) => {
        console.log("Login Info:", data);
        // TODO: Implement actual logging service
      },
    };

    return { useCase, loggerService };
  }
}
