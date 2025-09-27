/**
 * Product Variant Repository Implementation
 * PostgreSQL implementation of IProductVariantRepository
 */

import {
  ProductVariantEntity,
  ICreateProductVariantData,
  IUpdateProductVariantData,
} from "../../domain/entities/product-variant-entity";
import { IProductVariantRepository } from "../../domain/interfaces/product-domain-interfaces";
import { DatabaseFactory } from "../../../../shared/factories/databaseFactory";
import { EConnectionTypes } from "../../../../shared/infrastructure/config/database";

export class ProductVariantRepositoryImpl implements IProductVariantRepository {
  private db: any;

  constructor() {
    this.db = DatabaseFactory.getDatabase(EConnectionTypes.main);
  }

  /**
   * Create a new product variant
   */
  async create(
    variantData: ICreateProductVariantData
  ): Promise<ProductVariantEntity> {
    const {
      productId,
      name,
      sku,
      price,
      comparePrice,
      costPrice,
      stockQuantity = 0,
      weight,
      dimensions,
      imageUrl,
      attributes = {},
      isActive = true,
    } = variantData;

    const query = `
      INSERT INTO product_variants (
        product_id, name, sku, price, compare_price, cost_price,
        stock_quantity, weight, dimensions, image_url, attributes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      productId,
      name,
      sku,
      price,
      comparePrice,
      costPrice,
      stockQuantity,
      weight,
      JSON.stringify(dimensions),
      imageUrl,
      JSON.stringify(attributes),
      isActive,
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find variant by ID
   */
  async findById(id: string): Promise<ProductVariantEntity | null> {
    const query = "SELECT * FROM product_variants WHERE id = $1";
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find variant by SKU
   */
  async findBySku(sku: string): Promise<ProductVariantEntity | null> {
    const query = "SELECT * FROM product_variants WHERE sku = $1";
    const result = await this.db.query(query, [sku]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Update variant
   */
  async update(
    id: string,
    updateData: IUpdateProductVariantData
  ): Promise<ProductVariantEntity> {
    const fields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnake(key);

        // Handle JSON fields
        if (["dimensions", "attributes"].includes(key)) {
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
      UPDATE product_variants
      SET ${fields.join(", ")}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(`Product variant with id ${id} not found`);
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Delete variant
   */
  async delete(id: string): Promise<void> {
    const result = await this.db.query(
      "DELETE FROM product_variants WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error(`Product variant with id ${id} not found`);
    }
  }

  /**
   * Find all variants for a product
   */
  async findByProduct(productId: string): Promise<ProductVariantEntity[]> {
    const query = `
      SELECT * FROM product_variants
      WHERE product_id = $1
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [productId]);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Find active variants for a product
   */
  async findActiveByProduct(
    productId: string
  ): Promise<ProductVariantEntity[]> {
    const query = `
      SELECT * FROM product_variants
      WHERE product_id = $1 AND is_active = true
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [productId]);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Update stock quantity
   */
  async updateStock(variantId: string, quantity: number): Promise<void> {
    await this.db.query(
      "UPDATE product_variants SET stock_quantity = $1, updated_at = NOW() WHERE id = $2",
      [quantity, variantId]
    );
  }

  /**
   * Reserve stock (for orders)
   */
  async reserveStock(variantId: string, quantity: number): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE product_variants
       SET stock_quantity = stock_quantity - $1, updated_at = NOW()
       WHERE id = $2 AND stock_quantity >= $1
       RETURNING stock_quantity`,
      [quantity, variantId]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Release reserved stock
   */
  async releaseStock(variantId: string, quantity: number): Promise<void> {
    await this.db.query(
      "UPDATE product_variants SET stock_quantity = stock_quantity + $1, updated_at = NOW() WHERE id = $2",
      [quantity, variantId]
    );
  }

  /**
   * Check if variant exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.db.query(
      "SELECT 1 FROM product_variants WHERE id = $1",
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Check if SKU exists
   */
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    let query = "SELECT 1 FROM product_variants WHERE sku = $1";
    const values: any[] = [sku];

    if (excludeId) {
      query += " AND id != $2";
      values.push(excludeId);
    }

    const result = await this.db.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Delete all variants for a product
   */
  async deleteByProduct(productId: string): Promise<void> {
    await this.db.query("DELETE FROM product_variants WHERE product_id = $1", [
      productId,
    ]);
  }

  /**
   * Map database row to ProductVariantEntity
   */
  private mapRowToEntity(row: any): ProductVariantEntity {
    return new ProductVariantEntity({
      id: row.id,
      productId: row.product_id,
      name: row.name,
      sku: row.sku,
      price: row.price ? parseFloat(row.price) : undefined,
      comparePrice: row.compare_price
        ? parseFloat(row.compare_price)
        : undefined,
      costPrice: row.cost_price ? parseFloat(row.cost_price) : undefined,
      stockQuantity: row.stock_quantity,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      imageUrl: row.image_url,
      attributes: row.attributes ? JSON.parse(row.attributes) : {},
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
