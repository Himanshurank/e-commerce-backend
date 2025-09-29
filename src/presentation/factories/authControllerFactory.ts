import { AuthController } from "../controllers/authController";
import { SignupUseCase } from "../../application/usecases/auth/signupUseCase";
import { UserRepoImpl } from "../../infrastructure/repositories/userRepoImpl";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export class AuthControllerFactory {
  static create(
    databaseService: IDatabaseService,
    logger: ILoggerService
  ): AuthController {
    // Create repository implementation
    const userRepository = new UserRepoImpl(databaseService, logger);

    // Create use case
    const signupUseCase = new SignupUseCase(userRepository, logger);

    // Create and return controller
    return new AuthController(signupUseCase, logger);
  }
}

