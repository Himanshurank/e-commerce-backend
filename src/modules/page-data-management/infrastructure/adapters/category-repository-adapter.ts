/**
 * Category Repository Adapter
 * Adapts existing CategoryRepositoryImpl to page data interface
 */

import {
  ICategoryRepository as IPageDataCategoryRepository,
  ICategoryFilters,
  ICategoryWithCount,
} from "../../repositories/category-repository-interface";
import {
  ICategoryRepository,
  IQueryOptions,
} from "../../../product-management/domain/interfaces/product-domain-interfaces";
import { ILoggerService } from "../../../../shared/interfaces/logger-service-interface";

export class CategoryRepositoryAdapter implements IPageDataCategoryRepository {
  constructor(
    private readonly productCategoryRepository: ICategoryRepository,
    private readonly logger?: ILoggerService
  ) {}

  /**
   * Find categories with optional filters
   */
  public async findAll(
    filters?: ICategoryFilters | undefined
  ): Promise<ICategoryWithCount[]> {
    try {
      // For root categories (parentId is null), use findRootCategories
      if (filters?.parentId === null) {
        const sortBy = this.mapSortBy(filters?.sortBy);
        const queryOptions: IQueryOptions = {
          sortOrder: (filters?.sortOrder || "asc").toUpperCase() as
            | "ASC"
            | "DESC",
        };
        if (sortBy) {
          queryOptions.sortBy = sortBy;
        }

        const rootCategories =
          await this.productCategoryRepository.findRootCategories(queryOptions);

        // Map to page data format
        return rootCategories
          .slice(0, filters?.limit || 8)
          .map((category: any) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.imageUrl,
            parentId: category.parentId,
            status: category.isActive ? "ACTIVE" : "INACTIVE",
            productCount: 0, // TODO: Implement product count when needed
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          }));
      }

      // For all categories, use findAll
      const sortBy = this.mapSortBy(filters?.sortBy);
      const queryOptions: IQueryOptions = {
        limit: filters?.limit || 50,
        page: 1,
        sortOrder: (filters?.sortOrder || "asc").toUpperCase() as
          | "ASC"
          | "DESC",
      };
      if (sortBy) {
        queryOptions.sortBy = sortBy;
      }

      const result = await this.productCategoryRepository.findAll(queryOptions);

      // Map to page data format
      return result.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.imageUrl,
        parentId: category.parentId,
        status: category.isActive ? "ACTIVE" : "INACTIVE",
        productCount: 0, // TODO: Implement product count when needed
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
    } catch (error) {
      this.logger?.error(
        "CategoryRepositoryAdapter.findAll failed",
        error as Error
      );
      return [];
    }
  }

  /**
   * Count categories with optional filters
   */
  public async count(
    filters?: { status?: "ACTIVE" | "INACTIVE" | undefined } | undefined
  ): Promise<number> {
    try {
      // Use findAll to get total count (since count method doesn't exist)
      const result = await this.productCategoryRepository.findAll({ limit: 1 });
      return result.total;
    } catch (error) {
      this.logger?.error(
        "CategoryRepositoryAdapter.count failed",
        error as Error
      );
      return 0;
    }
  }

  /**
   * Map sort fields between interfaces
   */
  private mapSortBy(
    sortBy?: "name" | "product_count" | "created_at" | undefined
  ): "name" | "createdAt" | undefined {
    switch (sortBy) {
      case "product_count":
        return "name"; // Fallback to name since product_count sorting not available
      case "created_at":
        return "createdAt";
      case "name":
        return "name";
      default:
        return "name";
    }
  }
}
