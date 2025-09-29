import { HomepageController } from "../controllers/homepageController";
import { GetHomepageDataUseCase } from "../../application/usecases/homepage/getHomepageDataUseCase";
import { CategoryRepoImpl } from "../../infrastructure/repositories/categoryRepoImpl";
import { ProductRepoImpl } from "../../infrastructure/repositories/productRepoImpl";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export class HomepageControllerFactory {
  static create(
    databaseService: IDatabaseService,
    logger: ILoggerService
  ): HomepageController {
    // Create repository implementations
    const categoryRepository = new CategoryRepoImpl(databaseService, logger);
    const productRepository = new ProductRepoImpl(databaseService, logger);

    // Create use case
    const getHomepageDataUseCase = new GetHomepageDataUseCase(
      categoryRepository,
      productRepository,
      logger
    );

    // Create and return controller
    return new HomepageController(getHomepageDataUseCase, logger);
  }
}
