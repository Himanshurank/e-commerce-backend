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

export class CategoryRepositoryAdapter implements IPageDataCategoryRepository {
  constructor(
    private readonly productCategoryRepository: ICategoryRepository
  ) {}

  /**
   * Find categories with optional filters
   */
  public async findAll(
    filters?: ICategoryFilters | undefined
  ): Promise<ICategoryWithCount[]> {
    // For root categories (parentId is null), use findRootCategories
    if (filters?.parentId === null) {
      const sortBy = this.mapSortBy(filters?.sortBy);
      const queryOptions: IQueryOptions = {
        limit: filters?.limit || 50,
        page: Math.floor((filters?.offset || 0) / (filters?.limit || 50)) + 1,
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
      return rootCategories.map((category) => ({
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
      page: Math.floor((filters?.offset || 0) / (filters?.limit || 50)) + 1,
      sortOrder: (filters?.sortOrder || "asc").toUpperCase() as "ASC" | "DESC",
    };
    if (sortBy) {
      queryOptions.sortBy = sortBy;
    }

    const result = await this.productCategoryRepository.findAll(queryOptions);

    // Map to page data format
    return result.data.map((category) => ({
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

  /**
   * Count categories with optional filters
   */
  public async count(
    filters?: { status?: "ACTIVE" | "INACTIVE" | undefined } | undefined
  ): Promise<number> {
    // Use findAll to get total count (since count method doesn't exist)
    const result = await this.productCategoryRepository.findAll({ limit: 1 });
    return result.total;
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
