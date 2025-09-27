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

export class GetHomepageDataFactory {
  /**
   * Create GetHomepageDataUseCase with all dependencies
   */
  public static create(): GetHomepageDataUseCase {
    // Create product management repository instances
    const productCategoryRepository = new CategoryRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();

    // Create adapters to match page data interfaces
    const categoryRepositoryAdapter = new CategoryRepositoryAdapter(
      productCategoryRepository
    );
    const productRepositoryAdapter = new ProductRepositoryAdapter(
      productRepository
    );

    // Create domain service
    const homepageDataService = new HomepageDataService(
      categoryRepositoryAdapter,
      productRepositoryAdapter
    );

    // Create and return use case
    return new GetHomepageDataUseCase(homepageDataService);
  }
}
