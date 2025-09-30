import { Category } from "../../../domain/entities/catalog/category";
import { Product } from "../../../domain/entities/catalog/product";
import { ICategoryRepository } from "../../../infrastructure/repositories/categoryRepoImpl";
import { IProductRepository } from "../../../infrastructure/repositories/productRepoImpl";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";

export interface HomepageData {
  categories: Category[];
  featuredProducts: Product[];
}

export class GetHomepageDataUseCase {
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
