import { AuthController } from "../controllers/authController";
import { SignupUseCase } from "../../application/usecases/auth/signupUseCase";
import { SigninUseCase } from "../../application/usecases/auth/signinUseCase";
import { LogoutUseCase } from "../../application/usecases/auth/logoutUseCase";
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

    // Create use cases
    const signupUseCase = new SignupUseCase(userRepository, logger);
    const signinUseCase = new SigninUseCase(userRepository, logger);
    const logoutUseCase = new LogoutUseCase(logger);

    // Create and return controller
    return new AuthController(
      signupUseCase,
      signinUseCase,
      logoutUseCase,
      logger
    );
  }
}
