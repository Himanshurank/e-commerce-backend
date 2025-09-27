/**
 * Category Repository Interface for Page Data Module
 * Simplified interface focusing on homepage needs
 */

export interface ICategoryFilters {
  parentId?: string | null | undefined;
  status?: "ACTIVE" | "INACTIVE" | undefined;
  includeProductCount?: boolean | undefined;
  sortBy?: "name" | "product_count" | "created_at" | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface ICategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description?: string | undefined;
  image?: string | undefined;
  parentId?: string | null | undefined;
  status: "ACTIVE" | "INACTIVE";
  productCount?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryRepository {
  /**
   * Find categories with optional filters
   */
  findAll(
    filters?: ICategoryFilters | undefined
  ): Promise<ICategoryWithCount[]>;

  /**
   * Count categories with optional filters
   */
  count(
    filters?: { status?: "ACTIVE" | "INACTIVE" | undefined } | undefined
  ): Promise<number>;
}
