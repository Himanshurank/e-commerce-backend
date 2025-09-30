import { Router } from "express";
import { CartControllerFactory } from "../factories/cartControllerFactory";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export function createCartRoutes(
  databaseService: IDatabaseService,
  logger: ILoggerService
): Router {
  const router = Router();
  const cartController = CartControllerFactory.create(databaseService, logger);

  router.post("/add", cartController.addToCart.bind(cartController));
  router.get("/", cartController.getCart.bind(cartController));

  return router;
}
