/**
 * Product Repository Implementation
 * PostgreSQL implementation of IProductRepository
 */

import {
  ProductEntity,
  ICreateProductData,
  IUpdateProductData,
  ProductStatus,
} from "../../domain/entities/product-entity";
import {
  IProductRepository,
  IProductFilters,
  IQueryOptions,
  IPaginatedResult,
} from "../../domain/interfaces/product-domain-interfaces";
import { DatabaseFactory } from "../../../../shared/factories/databaseFactory";
import { EConnectionTypes } from "../../../../shared/infrastructure/config/database";

export class ProductRepositoryImpl implements IProductRepository {
  private db: any;

  constructor() {
    this.db = DatabaseFactory.getDatabase(EConnectionTypes.main);
  }

  /**
   * Create a new product
   */
  async create(productData: ICreateProductData): Promise<ProductEntity> {
    const {
      sellerId,
      categoryId,
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      sku,
      stockQuantity = 0,
      lowStockThreshold = 10,
      trackInventory = true,
      allowBackorders = false,
      weight,
      dimensions,
      images = [],
      videoUrl,
      status = ProductStatus.DRAFT,
      visibility = "public",
      password,
      seoTitle,
      seoDescription,
      seoKeywords,
      tags = [],
      attributes = {},
    } = productData;

    const query = `
      INSERT INTO products (
        seller_id, category_id, name, slug, description, short_description,
        price, compare_price, cost_price, sku, stock_quantity, low_stock_threshold,
        track_inventory, allow_backorders, weight, dimensions, images, video_url,
        status, visibility, password, seo_title, seo_description, seo_keywords,
        tags, attributes, view_count, favorite_count, average_rating, review_count
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, 0, 0, 0.00, 0
      )
      RETURNING *
    `;

    const values = [
      sellerId,
      categoryId,
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      sku,
      stockQuantity,
      lowStockThreshold,
      trackInventory,
      allowBackorders,
      weight,
      JSON.stringify(dimensions),
      JSON.stringify(images),
      videoUrl,
      status,
      visibility,
      password,
      seoTitle,
      seoDescription,
      seoKeywords,
      JSON.stringify(tags),
      JSON.stringify(attributes),
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<ProductEntity | null> {
    const query = "SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL";
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const query =
      "SELECT * FROM products WHERE slug = $1 AND deleted_at IS NULL";
    const result = await this.db.query(query, [slug]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<ProductEntity | null> {
    const query =
      "SELECT * FROM products WHERE sku = $1 AND deleted_at IS NULL";
    const result = await this.db.query(query, [sku]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Update product
   */
  async update(
    id: string,
    updateData: IUpdateProductData
  ): Promise<ProductEntity> {
    const fields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnake(key);

        // Handle JSON fields
        if (["dimensions", "images", "tags", "attributes"].includes(key)) {
          fields.push(`${dbField} = $${valueIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${dbField} = $${valueIndex}`);
          values.push(value);
        }
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${valueIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(`Product with id ${id} not found`);
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Hard delete product
   */
  async delete(id: string): Promise<void> {
    const result = await this.db.query("DELETE FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new Error(`Product with id ${id} not found`);
    }
  }

  /**
   * Soft delete product
   */
  async softDelete(id: string): Promise<void> {
    const result = await this.db.query(
      "UPDATE products SET deleted_at = NOW(), status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
      [ProductStatus.INACTIVE, id]
    );

    if (result.rowCount === 0) {
      throw new Error(`Product with id ${id} not found`);
    }
  }

  /**
   * Find all products with pagination
   */
  async findAll(
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<ProductEntity>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = options;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await this.db.query(
      "SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL"
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const query = `
      SELECT * FROM products
      WHERE deleted_at IS NULL
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query(query, [limit, offset]);
    const products = result.rows.map((row: any) => this.mapRowToEntity(row));

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Find products by filters
   */
  async findByFilters(
    filters: IProductFilters,
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<ProductEntity>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["deleted_at IS NULL"];
    const values: any[] = [];
    let valueIndex = 1;

    // Build WHERE conditions
    if (filters.sellerId) {
      conditions.push(`seller_id = $${valueIndex}`);
      values.push(filters.sellerId);
      valueIndex++;
    }

    if (filters.categoryId) {
      conditions.push(`category_id = $${valueIndex}`);
      values.push(filters.categoryId);
      valueIndex++;
    }

    if (filters.status) {
      conditions.push(`status = $${valueIndex}`);
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.minPrice !== undefined) {
      conditions.push(`price >= $${valueIndex}`);
      values.push(filters.minPrice);
      valueIndex++;
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(`price <= $${valueIndex}`);
      values.push(filters.maxPrice);
      valueIndex++;
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        conditions.push("(NOT track_inventory OR stock_quantity > 0)");
      } else {
        conditions.push("(track_inventory AND stock_quantity <= 0)");
      }
    }

    if (filters.search) {
      conditions.push(
        `(name ILIKE $${valueIndex} OR description ILIKE $${valueIndex})`
      );
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags ?| $${valueIndex}`);
      values.push(filters.tags);
      valueIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM products ${whereClause}`;
    const countResult = await this.db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const query = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;

    const result = await this.db.query(query, [...values, limit, offset]);
    const products = result.rows.map((row: any) => this.mapRowToEntity(row));

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Find products by seller
   */
  async findBySeller(
    sellerId: string,
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<ProductEntity>> {
    return this.findByFilters({ sellerId }, options);
  }

  /**
   * Find products by category
   */
  async findByCategory(
    categoryId: string,
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<ProductEntity>> {
    return this.findByFilters({ categoryId }, options);
  }

  /**
   * Search products (basic PostgreSQL search)
   */
  async search(
    query: string,
    filters: IProductFilters = {},
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<ProductEntity>> {
    return this.findByFilters({ ...filters, search: query }, options);
  }

  /**
   * Find related products (by category and tags)
   */
  async findRelatedProducts(
    productId: string,
    limit = 5
  ): Promise<ProductEntity[]> {
    const query = `
      WITH product_info AS (
        SELECT category_id, tags FROM products WHERE id = $1
      )
      SELECT p.* FROM products p, product_info pi
      WHERE p.id != $1
        AND p.deleted_at IS NULL
        AND p.status = 'active'
        AND (
          p.category_id = pi.category_id
          OR p.tags && pi.tags
        )
      ORDER BY
        CASE WHEN p.category_id = pi.category_id THEN 1 ELSE 2 END,
        p.average_rating DESC,
        p.created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [productId, limit]);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Find featured products
   */
  async findFeaturedProducts(limit = 10): Promise<ProductEntity[]> {
    const query = `
      SELECT * FROM products
      WHERE deleted_at IS NULL
        AND status = 'active'
        AND average_rating >= 4.0
      ORDER BY average_rating DESC, review_count DESC, created_at DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Update stock quantity
   */
  async updateStock(productId: string, quantity: number): Promise<void> {
    await this.db.query(
      "UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2",
      [quantity, productId]
    );
  }

  /**
   * Reserve stock (for orders)
   */
  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE products
       SET stock_quantity = stock_quantity - $1, updated_at = NOW()
       WHERE id = $2 AND stock_quantity >= $1
       RETURNING stock_quantity`,
      [quantity, productId]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Release reserved stock
   */
  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.db.query(
      "UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = NOW() WHERE id = $2",
      [quantity, productId]
    );
  }

  /**
   * Find products with low stock
   */
  async findLowStockProducts(sellerId?: string): Promise<ProductEntity[]> {
    let query = `
      SELECT * FROM products
      WHERE deleted_at IS NULL
        AND track_inventory = true
        AND stock_quantity <= low_stock_threshold
    `;
    const values: any[] = [];

    if (sellerId) {
      query += " AND seller_id = $1";
      values.push(sellerId);
    }

    query += " ORDER BY stock_quantity ASC, created_at DESC";

    const result = await this.db.query(query, values);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Increment view count
   */
  async incrementViewCount(productId: string): Promise<void> {
    await this.db.query(
      "UPDATE products SET view_count = view_count + 1, updated_at = NOW() WHERE id = $1",
      [productId]
    );
  }

  /**
   * Update rating
   */
  async updateRating(
    productId: string,
    averageRating: number,
    reviewCount: number
  ): Promise<void> {
    await this.db.query(
      "UPDATE products SET average_rating = $1, review_count = $2, updated_at = NOW() WHERE id = $3",
      [averageRating, reviewCount, productId]
    );
  }

  /**
   * Check if product exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.db.query(
      "SELECT 1 FROM products WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = "SELECT 1 FROM products WHERE slug = $1 AND deleted_at IS NULL";
    const values: any[] = [slug];

    if (excludeId) {
      query += " AND id != $2";
      values.push(excludeId);
    }

    const result = await this.db.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Check if SKU exists
   */
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    let query = "SELECT 1 FROM products WHERE sku = $1 AND deleted_at IS NULL";
    const values: any[] = [sku];

    if (excludeId) {
      query += " AND id != $2";
      values.push(excludeId);
    }

    const result = await this.db.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Count products by filters
   */
  async countByFilters(filters: IProductFilters): Promise<number> {
    const conditions: string[] = ["deleted_at IS NULL"];
    const values: any[] = [];
    let valueIndex = 1;

    // Build WHERE conditions (same as findByFilters)
    if (filters.sellerId) {
      conditions.push(`seller_id = $${valueIndex}`);
      values.push(filters.sellerId);
      valueIndex++;
    }

    if (filters.categoryId) {
      conditions.push(`category_id = $${valueIndex}`);
      values.push(filters.categoryId);
      valueIndex++;
    }

    if (filters.status) {
      conditions.push(`status = $${valueIndex}`);
      values.push(filters.status);
      valueIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    const countQuery = `SELECT COUNT(*) as count FROM products ${whereClause}`;
    const result = await this.db.query(countQuery, values);

    return parseInt(result.rows[0].count);
  }

  /**
   * Map database row to ProductEntity
   */
  private mapRowToEntity(row: any): ProductEntity {
    return new ProductEntity({
      id: row.id,
      sellerId: row.seller_id,
      categoryId: row.category_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      shortDescription: row.short_description,
      price: parseFloat(row.price),
      comparePrice: row.compare_price
        ? parseFloat(row.compare_price)
        : undefined,
      costPrice: row.cost_price ? parseFloat(row.cost_price) : undefined,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      trackInventory: row.track_inventory,
      allowBackorders: row.allow_backorders,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      images: row.images || [],
      videoUrl: row.video_url,
      status: row.status,
      visibility: row.visibility,
      password: row.password,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      seoKeywords: row.seo_keywords,
      tags: row.tags || [],
      attributes: row.attributes ? JSON.parse(row.attributes) : {},
      viewCount: row.view_count,
      favoriteCount: row.favorite_count,
      averageRating: parseFloat(row.average_rating),
      reviewCount: row.review_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    });
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
