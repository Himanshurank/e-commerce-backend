/**
 * Homepage Data Service
 * Business logic for homepage data operations
 */

import {
  IHomepageDataService,
  IHomepageDataFilters,
} from "../interfaces/page-data-domain-interfaces";
import {
  IHomepageDataEntity,
  HomepageDataEntity,
} from "../entities/homepage-data-entity";
import { ICategoryRepository } from "../../repositories/category-repository-interface";
import { IProductRepository } from "../../repositories/product-repository-interface";

export class HomepageDataService implements IHomepageDataService {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly productRepository: IProductRepository
  ) {}

  /**
   * Build complete homepage data from multiple sources
   */
  public async buildHomepageData(
    filters?: IHomepageDataFilters | undefined
  ): Promise<IHomepageDataEntity> {
    const categoryLimit = filters?.categoryLimit || 8;
    const featuredProductLimit = filters?.featuredProductLimit || 8;

    // Execute all queries in parallel for better performance
    const [categories, featuredProducts, metadata] = await Promise.all([
      this.getTopLevelCategories(categoryLimit),
      this.getFeaturedProducts(featuredProductLimit),
      this.getHomepageMetadata(),
    ]);

    const homepageData: IHomepageDataEntity = {
      categories,
      products: {
        featured: featuredProducts,
      },
      metadata: {
        ...metadata,
        lastUpdated: new Date(),
        cacheExpiry: this.generateCacheExpiry(),
      },
    };

    return new HomepageDataEntity(homepageData);
  }

  /**
   * Get top-level categories with product counts
   */
  private async getTopLevelCategories(limit: number) {
    // Get root categories (parent_id is null) with product counts
    const categories = await this.categoryRepository.findAll({
      parentId: null,
      status: "ACTIVE",
      includeProductCount: true,
      sortBy: "product_count",
      sortOrder: "desc",
      limit,
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category.productCount || 0,
    }));
  }

  /**
   * Get featured products with seller information
   */
  private async getFeaturedProducts(limit: number) {
    // Get products that are either admin-promoted OR have high ratings/views
    const featuredProducts = await this.productRepository.findAll({
      status: "ACTIVE",
      visibility: "PUBLIC",
      sortBy: "featured_priority", // Custom sort combining admin promotion + popularity
      sortOrder: "desc",
      limit,
      includeSellerInfo: true,
      includeCategoryInfo: true,
    });

    return featuredProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      discountPrice: product.discountPrice,
      currency: product.currency,
      images: product.images || [],
      categoryName: product.categoryName || "Uncategorized",
      sellerName: product.sellerName || "Unknown Seller",
      sellerRating: product.sellerRating,
      viewCount: product.viewCount || 0,
      salesCount: product.salesCount || 0,
      rating: product.averageRating,
      reviewCount: product.reviewCount,
    }));
  }

  /**
   * Get homepage metadata (total counts)
   */
  private async getHomepageMetadata() {
    const [totalCategories, totalProducts] = await Promise.all([
      this.categoryRepository.count({ status: "ACTIVE" }),
      this.productRepository.count({
        status: "ACTIVE",
        visibility: "PUBLIC",
      }),
    ]);

    return {
      totalCategories,
      totalProducts,
    };
  }

  /**
   * Generate cache expiry time (15 minutes from now)
   */
  public generateCacheExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    return expiry;
  }
}
