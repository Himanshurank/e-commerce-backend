/**
 * Get Product Factory
 * Factory for creating GetProductUseCase with dependencies
 */

import { GetProductUseCase } from "./get-product-use-case";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/product-repository-impl";
import { LoggerFactory } from "../../../../../shared/factories/logger-factory";

export class GetProductFactory {
  static create(): GetProductUseCase {
    const productRepository = new ProductRepositoryImpl();
    const logger = LoggerFactory.getInstance();
    return new GetProductUseCase(productRepository, logger);
  }
}
