import { Router } from "express";
import { HomepageControllerFactory } from "../factories/homepageControllerFactory";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export function createHomepageRoutes(
  databaseService: IDatabaseService,
  logger: ILoggerService
): Router {
  const router = Router();
  const homepageController = HomepageControllerFactory.create(
    databaseService,
    logger
  );

  /**
   * @route GET /api/homepage
   * @desc Get homepage data including categories and featured products
   * @access Public
   */
  router.get("/", homepageController.getHomepageData.bind(homepageController));

  return router;
}
