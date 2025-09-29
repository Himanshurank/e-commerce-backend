/**
 * Create Category Factory
 * Factory for creating CreateCategoryUseCase with dependencies
 */

import { CreateCategoryUseCase } from "./create-category-use-case";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/category-repository-impl";
import { LoggerFactory } from "../../../../../shared/factories/logger-factory";

export class CreateCategoryFactory {
  static create(): CreateCategoryUseCase {
    const categoryRepository = new CategoryRepositoryImpl();
    const logger = LoggerFactory.getInstance();
    return new CreateCategoryUseCase(categoryRepository, logger);
  }
}
