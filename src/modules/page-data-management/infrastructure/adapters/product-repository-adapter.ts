/**
 * Product Repository Adapter
 * Adapts existing ProductRepositoryImpl to page data interface
 */

import {
  IProductRepository as IPageDataProductRepository,
  IProductFilters,
  IProductWithDetails,
} from "../../repositories/product-repository-interface";
import {
  IProductRepository,
  IQueryOptions,
} from "../../../product-management/domain/interfaces/product-domain-interfaces";

export class ProductRepositoryAdapter implements IPageDataProductRepository {
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Find products with optional filters
   */
  public async findAll(
    filters?: IProductFilters | undefined
  ): Promise<IProductWithDetails[]> {
    try {
      // Use findAll method to get active products instead of findFeaturedProducts
      const limit = filters?.limit || 8;
      const queryOptions: IQueryOptions = {
        limit: limit,
        page: 1,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      const result = await this.productRepository.findAll(queryOptions);

      // Map to page data format with additional fields
      return result.data.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.price,
        discountPrice: product.comparePrice,
        currency: "USD", // Default currency since not in entity
        images: product.images.map((img) => img.url),
        viewCount: product.viewCount || 0,
        salesCount: 0, // TODO: Implement sales count when needed
        averageRating: this.calculateAverageRating(product),
        reviewCount: this.calculateReviewCount(product),
        isPromoted: this.checkIfPromoted(product),
        categoryName: this.getCategoryName(product),
        sellerName: this.getSellerName(product),
        sellerRating: this.getSellerRating(product),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      console.error("ProductRepositoryAdapter.findAll Error:", error);
      return [];
    }
  }

  /**
   * Count products with optional filters
   */
  public async count(
    filters?:
      | {
          status?: "ACTIVE" | "INACTIVE" | "DRAFT" | undefined;
          visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
        }
      | undefined
  ): Promise<number> {
    try {
      // Use findAll to get total count
      const result = await this.productRepository.findAll({ limit: 1 });
      return result.total;
    } catch (error) {
      console.error("ProductRepositoryAdapter.count Error:", error);
      return 0;
    }
  }

  /**
   * Map sort fields between interfaces
   */
  private mapSortBy(
    sortBy?: string | undefined
  ): "name" | "price" | "createdAt" | "viewCount" | undefined {
    switch (sortBy) {
      case "name":
        return "name";
      case "price":
        return "price";
      case "created_at":
        return "createdAt";
      case "view_count":
        return "viewCount";
      case "sales_count":
        return "viewCount"; // Fallback to viewCount since salesCount not available
      case "featured_priority":
        // For featured priority, we'll use view count as a proxy for now
        // In the future, this could be a computed field
        return "viewCount";
      default:
        return undefined;
    }
  }

  /**
   * Calculate average rating (placeholder - to be implemented with reviews)
   */
  private calculateAverageRating(product: any): number | undefined {
    // TODO: Implement when review system is available
    // For now, return a mock rating based on view count
    if (product.viewCount && product.viewCount > 100) {
      return Math.min(4 + product.viewCount / 1000, 5);
    }
    return undefined;
  }

  /**
   * Calculate review count (placeholder - to be implemented with reviews)
   */
  private calculateReviewCount(product: any): number | undefined {
    // TODO: Implement when review system is available
    // For now, return a mock count based on sales
    if (product.salesCount && product.salesCount > 5) {
      return Math.floor(product.salesCount * 0.3);
    }
    return undefined;
  }

  /**
   * Check if product is promoted (placeholder - to be implemented with admin features)
   */
  private checkIfPromoted(product: any): boolean | undefined {
    // TODO: Implement when admin promotion system is available
    // For now, consider products with high view count as "promoted"
    return product.viewCount && product.viewCount > 500;
  }

  /**
   * Get category name (placeholder - to be implemented with joins)
   */
  private getCategoryName(product: any): string | undefined {
    // TODO: Implement proper category name resolution
    // For now, return a default category name
    return "General";
  }

  /**
   * Get seller name (placeholder - to be implemented with joins)
   */
  private getSellerName(product: any): string | undefined {
    // TODO: Implement proper seller name resolution
    // For now, return a default seller name
    return "Store Owner";
  }

  /**
   * Get seller rating (placeholder - to be implemented with seller ratings)
   */
  private getSellerRating(product: any): number | undefined {
    // TODO: Implement when seller rating system is available
    // For now, return a mock rating
    return 4.2;
  }
}
