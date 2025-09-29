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

  router.post("/signup", authController.signup.bind(authController));

  router.post("/signin", authController.signin.bind(authController));

  router.post("/logout", authController.logout.bind(authController));

  return router;
}
