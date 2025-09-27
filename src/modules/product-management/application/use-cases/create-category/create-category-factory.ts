/**
 * Create Category Factory
 * Factory for creating CreateCategoryUseCase with dependencies
 */

import { CreateCategoryUseCase } from "./create-category-use-case";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/category-repository-impl";

export class CreateCategoryFactory {
  static create(): CreateCategoryUseCase {
    const categoryRepository = new CategoryRepositoryImpl();
    return new CreateCategoryUseCase(categoryRepository);
  }
}
