/**
 * Get Product Factory
 * Factory for creating GetProductUseCase with dependencies
 */

import { GetProductUseCase } from "./get-product-use-case";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/product-repository-impl";

export class GetProductFactory {
  static create(): GetProductUseCase {
    const productRepository = new ProductRepositoryImpl();
    return new GetProductUseCase(productRepository);
  }
}
