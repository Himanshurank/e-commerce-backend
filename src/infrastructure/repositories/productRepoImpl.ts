import { IProductRepository } from "../../domain/interfaces/infrastructure/repositories/productRepository";
import { Product } from "../../domain/entities/catalog/product";
import { TProductRecord } from "../../domain/types/infrastructure/repositories/productRepository";
import { ProductStatus } from "../../domain/enum/productStatus";
import { ProductVisibility } from "../../domain/enum/productVisibility";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export class ProductRepoImpl implements IProductRepository {
  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async findById(id: string): Promise<Product | null> {
    try {
      const query = `
        SELECT * FROM products
        WHERE id = $1
          AND status = $2
          AND visibility = $3
          AND deleted_at IS NULL
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [id, ProductStatus.ACTIVE, ProductVisibility.PUBLIC],
        "findProductById"
      );

      return results.length > 0 && results[0]
        ? Product.create(results[0])
        : null;
    } catch (error: any) {
      this.logger.error("Failed to find product by ID", {
        error: error.message,
        productId: id,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findBySlug(slug: string, sellerId: string): Promise<Product | null> {
    try {
      const query = `
        SELECT * FROM products
        WHERE slug = $1
          AND seller_id = $2
          AND status = $3
          AND visibility = $4
          AND deleted_at IS NULL
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [slug, sellerId, ProductStatus.ACTIVE, ProductVisibility.PUBLIC],
        "findProductBySlug"
      );

      return results.length > 0 && results[0]
        ? Product.create(results[0])
        : null;
    } catch (error: any) {
      this.logger.error("Failed to find product by slug", {
        error: error.message,
        slug,
        sellerId,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findFeaturedProducts(limit: number = 12): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products
        WHERE status = $1
          AND visibility = $2
          AND deleted_at IS NULL
          AND stock_quantity > 0
          AND images IS NOT NULL
        ORDER BY view_count DESC, average_rating DESC, created_at DESC
        LIMIT $3
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [ProductStatus.ACTIVE, ProductVisibility.PUBLIC, limit],
        "findFeaturedProducts"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find featured products", {
        error: error.message,
        limit,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findLatestProducts(limit: number = 8): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products
        WHERE status = $1
          AND visibility = $2
          AND deleted_at IS NULL
          AND stock_quantity > 0
        ORDER BY created_at DESC
        LIMIT $3
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [ProductStatus.ACTIVE, ProductVisibility.PUBLIC, limit],
        "findLatestProducts"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find latest products", {
        error: error.message,
        limit,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findByCategory(
    categoryId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products
        WHERE category_id = $1
          AND status = $2
          AND visibility = $3
          AND deleted_at IS NULL
          AND stock_quantity > 0
        ORDER BY created_at DESC
        LIMIT $4 OFFSET $5
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [
          categoryId,
          ProductStatus.ACTIVE,
          ProductVisibility.PUBLIC,
          limit,
          offset,
        ],
        "findProductsByCategory"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find products by category", {
        error: error.message,
        categoryId,
        limit,
        offset,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findBestSellingProducts(limit: number = 8): Promise<Product[]> {
    try {
      // This would typically join with order_items to get actual sales data
      // For now, we'll use view_count as a proxy for popularity
      const query = `
        SELECT * FROM products
        WHERE status = $1
          AND visibility = $2
          AND deleted_at IS NULL
          AND stock_quantity > 0
        ORDER BY view_count DESC, favorite_count DESC
        LIMIT $3
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [ProductStatus.ACTIVE, ProductVisibility.PUBLIC, limit],
        "findBestSellingProducts"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find best selling products", {
        error: error.message,
        limit,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findTopRatedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products
        WHERE status = $1
          AND visibility = $2
          AND deleted_at IS NULL
          AND stock_quantity > 0
          AND review_count > 0
        ORDER BY average_rating DESC, review_count DESC
        LIMIT $3
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [ProductStatus.ACTIVE, ProductVisibility.PUBLIC, limit],
        "findTopRatedProducts"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find top rated products", {
        error: error.message,
        limit,
        stack: error.stack,
      });
      throw error;
    }
  }

  async searchProducts(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Product[]> {
    try {
      const searchQuery = `
        SELECT * FROM products
        WHERE (name ILIKE $1 OR description ILIKE $1)
          AND status = $2
          AND visibility = $3
          AND deleted_at IS NULL
          AND stock_quantity > 0
        ORDER BY
          CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
          average_rating DESC,
          created_at DESC
        LIMIT $4 OFFSET $5
      `;

      const searchTerm = `%${query}%`;
      const results = await this.databaseService.select<TProductRecord>(
        searchQuery,
        [
          searchTerm,
          ProductStatus.ACTIVE,
          ProductVisibility.PUBLIC,
          limit,
          offset,
        ],
        "searchProducts"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to search products", {
        error: error.message,
        query,
        limit,
        offset,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findBySeller(
    sellerId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products
        WHERE seller_id = $1
          AND status = $2
          AND visibility = $3
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $4 OFFSET $5
      `;

      const results = await this.databaseService.select<TProductRecord>(
        query,
        [
          sellerId,
          ProductStatus.ACTIVE,
          ProductVisibility.PUBLIC,
          limit,
          offset,
        ],
        "findProductsBySeller"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find products by seller", {
        error: error.message,
        sellerId,
        limit,
        offset,
        stack: error.stack,
      });
      throw error;
    }
  }

  async countByCategory(categoryId: string): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM products
        WHERE category_id = $1
          AND status = $2
          AND visibility = $3
          AND deleted_at IS NULL
      `;

      const results = await this.databaseService.select<{ count: string }>(
        query,
        [categoryId, ProductStatus.ACTIVE, ProductVisibility.PUBLIC],
        "countProductsByCategory"
      );

      return parseInt(results[0]?.count || "0", 10);
    } catch (error: any) {
      this.logger.error("Failed to count products by category", {
        error: error.message,
        categoryId,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findRandomProducts(
    limit: number = 8,
    excludeIds: string[] = []
  ): Promise<Product[]> {
    try {
      const excludeCondition =
        excludeIds.length > 0
          ? `AND id NOT IN (${excludeIds
              .map((_, i) => `$${i + 4}`)
              .join(", ")})`
          : "";

      const query = `
        SELECT * FROM products
        WHERE status = $1
          AND visibility = $2
          AND deleted_at IS NULL
          AND stock_quantity > 0
          ${excludeCondition}
        ORDER BY RANDOM()
        LIMIT $3
      `;

      const params = [
        ProductStatus.ACTIVE,
        ProductVisibility.PUBLIC,
        limit,
        ...excludeIds,
      ];
      const results = await this.databaseService.select<TProductRecord>(
        query,
        params,
        "findRandomProducts"
      );

      return results.map((record) => Product.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find random products", {
        error: error.message,
        limit,
        excludeIds,
        stack: error.stack,
      });
      throw error;
    }
  }
}
