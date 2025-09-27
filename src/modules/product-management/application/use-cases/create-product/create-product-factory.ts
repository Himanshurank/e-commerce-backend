/**
 * Create Product Factory
 * Factory for creating CreateProductUseCase with dependencies
 */

import { CreateProductUseCase } from "./create-product-use-case";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/product-repository-impl";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/category-repository-impl";

export class CreateProductFactory {
  static create(): CreateProductUseCase {
    const productRepository = new ProductRepositoryImpl();
    const categoryRepository = new CategoryRepositoryImpl();
    return new CreateProductUseCase(productRepository, categoryRepository);
  }
}
