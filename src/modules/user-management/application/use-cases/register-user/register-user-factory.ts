import { RegisterUserUseCase } from "./register-user-use-case";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user-repository-impl";
import { UserValidationService } from "../../../domain/services/user-validation-service";
import { DatabaseService } from "../../../../../shared/infrastructure/services/databaseService";
import { DatabaseFactory } from "../../../../../shared/factories/databaseFactory";
import { LoggerFactory } from "../../../../../shared/factories/logger-factory";
import { ILoggerService } from "../../../../../shared/interfaces/logger-service-interface";

export class RegisterUserFactory {
  static async create(req: any): Promise<{
    useCase: RegisterUserUseCase;
    loggerService: ILoggerService;
  }> {
    // Create database service
    const databaseService = DatabaseFactory.create();

    // Create repository
    const userRepository = new UserRepositoryImpl(databaseService);

    // Create domain service
    const userDomainService = new UserValidationService();

    // Create logger service
    const loggerService = LoggerFactory.getInstance();

    // Create use case with logger
    const useCase = new RegisterUserUseCase(
      userRepository,
      userDomainService,
      loggerService
    );

    return { useCase, loggerService };
  }
}
