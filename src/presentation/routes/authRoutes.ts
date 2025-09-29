import { Router } from "express";
import { AuthControllerFactory } from "../factories/authControllerFactory";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export function createAuthRoutes(
  databaseService: IDatabaseService,
  logger: ILoggerService
): Router {
  const router = Router();
  const authController = AuthControllerFactory.create(databaseService, logger);

  /**
   * @route POST /api/auth/signup
   * @desc Register a new user
   * @access Public
   */
  router.post("/signup", authController.signup.bind(authController));

  return router;
}

