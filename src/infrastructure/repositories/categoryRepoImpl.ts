import { ICategoryRepository } from "../../domain/interfaces/infrastructure/repositories/categoryRepository";
import { Category } from "../../domain/entities/catalog/category";
import { TCategoryRecord } from "../../domain/types/infrastructure/repositories/categoryRepository";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export class CategoryRepoImpl implements ICategoryRepository {
  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async findRootCategories(): Promise<Category[]> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE parent_id IS NULL
          AND is_active = true
        ORDER BY sort_order ASC, name ASC
      `;

      const results = await this.databaseService.select<TCategoryRecord>(
        query,
        [],
        "findRootCategories"
      );

      return results.map((record) => Category.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find root categories", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAllActiveCategories(): Promise<Category[]> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE is_active = true
        ORDER BY level ASC, sort_order ASC, name ASC
      `;

      const results = await this.databaseService.select<TCategoryRecord>(
        query,
        [],
        "findAllActiveCategories"
      );

      return results.map((record) => Category.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find all active categories", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE id = $1 AND is_active = true
      `;

      const results = await this.databaseService.select<TCategoryRecord>(
        query,
        [id],
        "findCategoryById"
      );

      return results.length > 0 && results[0]
        ? Category.create(results[0])
        : null;
    } catch (error: any) {
      this.logger.error("Failed to find category by ID", {
        error: error.message,
        categoryId: id,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE slug = $1 AND is_active = true
      `;

      const results = await this.databaseService.select<TCategoryRecord>(
        query,
        [slug],
        "findCategoryBySlug"
      );

      return results.length > 0 && results[0]
        ? Category.create(results[0])
        : null;
    } catch (error: any) {
      this.logger.error("Failed to find category by slug", {
        error: error.message,
        slug,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findChildCategories(parentId: string): Promise<Category[]> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE parent_id = $1 AND is_active = true
        ORDER BY sort_order ASC, name ASC
      `;

      const results = await this.databaseService.select<TCategoryRecord>(
        query,
        [parentId],
        "findChildCategories"
      );

      return results.map((record) => Category.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find child categories", {
        error: error.message,
        parentId,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findFeaturedCategories(limit: number = 8): Promise<Category[]> {
    try {
      const query = `
        SELECT * FROM categories
        WHERE is_active = true
        ORDER BY sort_order ASC, name ASC
        LIMIT $1
      `;

      const results = await this.databaseService.select<TCategoryRecord>(
        query,
        [limit],
        "findFeaturedCategories"
      );

      return results.map((record) => Category.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find featured categories", {
        error: error.message,
        limit,
        stack: error.stack,
      });
      throw error;
    }
  }
}
