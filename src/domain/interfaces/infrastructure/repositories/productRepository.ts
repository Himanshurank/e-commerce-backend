import { Product } from "../../../entities/catalog/product";

export interface IProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find product by slug and seller ID
   */
  findBySlug(slug: string, sellerId: string): Promise<Product | null>;

  /**
   * Get featured products for homepage
   */
  findFeaturedProducts(limit?: number): Promise<Product[]>;

  /**
   * Get latest products
   */
  findLatestProducts(limit?: number): Promise<Product[]>;

  /**
   * Get products by category
   */
  findByCategory(
    categoryId: string,
    limit?: number,
    offset?: number
  ): Promise<Product[]>;

  /**
   * Get best selling products
   */
  findBestSellingProducts(limit?: number): Promise<Product[]>;

  /**
   * Get products with highest ratings
   */
  findTopRatedProducts(limit?: number): Promise<Product[]>;

  /**
   * Search products by name or description
   */
  searchProducts(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<Product[]>;

  /**
   * Get products by seller
   */
  findBySeller(
    sellerId: string,
    limit?: number,
    offset?: number
  ): Promise<Product[]>;

  /**
   * Count total products by category
   */
  countByCategory(categoryId: string): Promise<number>;

  /**
   * Get random products for recommendations
   */
  findRandomProducts(limit?: number, excludeIds?: string[]): Promise<Product[]>;
}
