/**
 * Get Homepage Data Factory
 * Factory for creating GetHomepageDataUseCase instances with dependencies
 */

import { GetHomepageDataUseCase } from "./get-homepage-data-use-case";
import { HomepageDataService } from "../../../domain/services/homepage-data-service";
import { CategoryRepositoryImpl } from "../../../../product-management/infrastructure/repositories/category-repository-impl";
import { ProductRepositoryImpl } from "../../../../product-management/infrastructure/repositories/product-repository-impl";
import { CategoryRepositoryAdapter } from "../../../infrastructure/adapters/category-repository-adapter";
import { ProductRepositoryAdapter } from "../../../infrastructure/adapters/product-repository-adapter";
import { LoggerFactory } from "../../../../../shared/factories/logger-factory";

export class GetHomepageDataFactory {
  /**
   * Create GetHomepageDataUseCase with all dependencies
   */
  public static create(): GetHomepageDataUseCase {
    // Create product management repository instances
    const productCategoryRepository = new CategoryRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();

    // Create logger service
    const logger = LoggerFactory.getInstance();

    // Create adapters to match page data interfaces with logger
    const categoryRepositoryAdapter = new CategoryRepositoryAdapter(
      productCategoryRepository,
      logger
    );
    const productRepositoryAdapter = new ProductRepositoryAdapter(
      productRepository,
      logger
    );

    // Create domain service with logger
    const homepageDataService = new HomepageDataService(
      categoryRepositoryAdapter,
      productRepositoryAdapter,
      logger
    );

    // Create and return use case with logger
    return new GetHomepageDataUseCase(homepageDataService, logger);
  }
}
