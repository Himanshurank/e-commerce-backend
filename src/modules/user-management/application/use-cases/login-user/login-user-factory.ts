import { LoginUserUseCase } from "./login-user-use-case";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user-repository-impl";
import { UserValidationService } from "../../../domain/services/user-validation-service";
import { DatabaseFactory } from "../../../../../shared/factories/databaseFactory";
import { LoggerFactory } from "../../../../../shared/factories/logger-factory";
import { ILoggerService } from "../../../../../shared/interfaces/logger-service-interface";

export class LoginUserFactory {
  static async create(req: any): Promise<{
    useCase: LoginUserUseCase;
    loggerService: ILoggerService;
  }> {
    // Create database service
    const databaseService = DatabaseFactory.create();

    // Create repository
    const userRepository = new UserRepositoryImpl(databaseService);

    // Create logger service
    const loggerService = LoggerFactory.getInstance();

    // Create domain service with logger
    const userDomainService = new UserValidationService(loggerService);

    // Create use case with logger
    const useCase = new LoginUserUseCase(
      userRepository,
      userDomainService,
      loggerService
    );

    return { useCase, loggerService };
  }
}
