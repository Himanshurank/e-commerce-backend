import {
  IGetHomepageDataUseCase,
  HomepageData,
} from "../../../domain/interfaces/application/usecases/getHomepageDataUseCase";
import { ICategoryRepository } from "../../../domain/interfaces/infrastructure/repositories/categoryRepository";
import { IProductRepository } from "../../../domain/interfaces/infrastructure/repositories/productRepository";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";

export class GetHomepageDataUseCase implements IGetHomepageDataUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly productRepository: IProductRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(): Promise<HomepageData> {
    try {
      // Fetch categories and featured products in parallel for better performance
      const [categories, featuredProducts] = await Promise.all([
        this.categoryRepository.findFeaturedCategories(8), // Limit to 8 categories
        this.productRepository.findFeaturedProducts(12), // Limit to 12 featured products
      ]);

      return {
        categories,
        featuredProducts,
      };
    } catch (error: any) {
      this.logger.error("Homepage data retrieval failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
