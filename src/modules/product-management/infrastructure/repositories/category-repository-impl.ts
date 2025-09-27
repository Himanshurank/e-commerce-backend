/**
 * Category Repository Implementation
 * PostgreSQL implementation of ICategoryRepository
 */

import {
  CategoryEntity,
  ICreateCategoryData,
  IUpdateCategoryData,
} from "../../domain/entities/category-entity";
import {
  ICategoryRepository,
  ICategoryFilters,
  IQueryOptions,
  IPaginatedResult,
} from "../../domain/interfaces/product-domain-interfaces";
import { DatabaseFactory } from "../../../../shared/factories/databaseFactory";
import { EConnectionTypes } from "../../../../shared/infrastructure/config/database";

export class CategoryRepositoryImpl implements ICategoryRepository {
  private db: any;

  constructor() {
    this.db = DatabaseFactory.getDatabase(EConnectionTypes.main);
  }

  /**
   * Create a new category
   */
  async create(categoryData: ICreateCategoryData): Promise<CategoryEntity> {
    const {
      name,
      slug,
      description,
      imageUrl,
      parentId,
      sortOrder = 0,
      seoTitle,
      seoDescription,
      seoKeywords,
      isActive = true,
    } = categoryData;

    // Calculate level based on parent
    let level = 0;
    if (parentId) {
      const parentResult = await this.db.query(
        "SELECT level FROM categories WHERE id = $1",
        [parentId]
      );
      if (parentResult.rows.length > 0) {
        level = parentResult.rows[0].level + 1;
      }
    }

    const query = `
      INSERT INTO categories (
        name, slug, description, image_url, parent_id, level, sort_order,
        seo_title, seo_description, seo_keywords, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      name,
      slug,
      description,
      imageUrl,
      parentId,
      level,
      sortOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
      isActive,
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<CategoryEntity | null> {
    const query = "SELECT * FROM categories WHERE id = $1";
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const query = "SELECT * FROM categories WHERE slug = $1";
    const result = await this.db.query(query, [slug]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Update category
   */
  async update(
    id: string,
    updateData: IUpdateCategoryData
  ): Promise<CategoryEntity> {
    const fields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnake(key);
        fields.push(`${dbField} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    // Handle parent_id change - recalculate level
    if (updateData.parentId !== undefined) {
      let level = 0;
      if (updateData.parentId) {
        const parentResult = await this.db.query(
          "SELECT level FROM categories WHERE id = $1",
          [updateData.parentId]
        );
        if (parentResult.rows.length > 0) {
          level = parentResult.rows[0].level + 1;
        }
      }
      fields.push(`level = $${valueIndex}`);
      values.push(level);
      valueIndex++;
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    const query = `
      UPDATE categories
      SET ${fields.join(", ")}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(`Category with id ${id} not found`);
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    // Check if category has children
    const childrenResult = await this.db.query(
      "SELECT COUNT(*) as count FROM categories WHERE parent_id = $1",
      [id]
    );

    if (parseInt(childrenResult.rows[0].count) > 0) {
      throw new Error(
        "Cannot delete category with children. Delete children first."
      );
    }

    const result = await this.db.query("DELETE FROM categories WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new Error(`Category with id ${id} not found`);
    }
  }

  /**
   * Find all categories with pagination
   */
  async findAll(
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<CategoryEntity>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "sort_order",
      sortOrder = "ASC",
    } = options;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await this.db.query(
      "SELECT COUNT(*) as count FROM categories"
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const query = `
      SELECT * FROM categories
      ORDER BY ${sortBy} ${sortOrder}, created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query(query, [limit, offset]);
    const categories = result.rows.map((row: any) => this.mapRowToEntity(row));

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Find categories by filters
   */
  async findByFilters(
    filters: ICategoryFilters,
    options: IQueryOptions = {}
  ): Promise<IPaginatedResult<CategoryEntity>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "sort_order",
      sortOrder = "ASC",
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Build WHERE conditions
    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        conditions.push("parent_id IS NULL");
      } else {
        conditions.push(`parent_id = $${valueIndex}`);
        values.push(filters.parentId);
        valueIndex++;
      }
    }

    if (filters.level !== undefined) {
      conditions.push(`level = $${valueIndex}`);
      values.push(filters.level);
      valueIndex++;
    }

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${valueIndex}`);
      values.push(filters.isActive);
      valueIndex++;
    }

    if (filters.search) {
      conditions.push(
        `(name ILIKE $${valueIndex} OR description ILIKE $${valueIndex})`
      );
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM categories ${whereClause}`;
    const countResult = await this.db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const query = `
      SELECT * FROM categories
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}, created_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;

    const result = await this.db.query(query, [...values, limit, offset]);
    const categories = result.rows.map((row: any) => this.mapRowToEntity(row));

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Find children of a category
   */
  async findChildren(
    parentId: string,
    options: IQueryOptions = {}
  ): Promise<CategoryEntity[]> {
    const { sortBy = "sort_order", sortOrder = "ASC" } = options;

    const query = `
      SELECT * FROM categories
      WHERE parent_id = $1
      ORDER BY ${sortBy} ${sortOrder}
    `;

    const result = await this.db.query(query, [parentId]);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Find root categories (no parent)
   */
  async findRootCategories(
    options: IQueryOptions = {}
  ): Promise<CategoryEntity[]> {
    const { sortBy = "sort_order", sortOrder = "ASC" } = options;

    const query = `
      SELECT * FROM categories
      WHERE parent_id IS NULL
      ORDER BY ${sortBy} ${sortOrder}
    `;

    const result = await this.db.query(query);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Get complete category tree
   */
  async findCategoryTree(): Promise<CategoryEntity[]> {
    const query = `
      SELECT * FROM categories
      ORDER BY level ASC, sort_order ASC, name ASC
    `;

    const result = await this.db.query(query);
    return result.rows.map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Check if category exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.db.query(
      "SELECT 1 FROM categories WHERE id = $1",
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = "SELECT 1 FROM categories WHERE slug = $1";
    const values: any[] = [slug];

    if (excludeId) {
      query += " AND id != $2";
      values.push(excludeId);
    }

    const result = await this.db.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Update sort order
   */
  async updateSortOrder(categoryId: string, sortOrder: number): Promise<void> {
    await this.db.query(
      "UPDATE categories SET sort_order = $1, updated_at = NOW() WHERE id = $2",
      [sortOrder, categoryId]
    );
  }

  /**
   * Map database row to CategoryEntity
   */
  private mapRowToEntity(row: any): CategoryEntity {
    return new CategoryEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.image_url,
      parentId: row.parent_id,
      level: row.level,
      sortOrder: row.sort_order,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      seoKeywords: row.seo_keywords,
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
