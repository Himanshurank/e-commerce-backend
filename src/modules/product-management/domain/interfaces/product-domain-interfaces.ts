/**
 * Product Management Domain Interfaces (Cleaned)
 * Repository interfaces following Clean Architecture principles
 * Only includes currently used methods
 */

import {
  CategoryEntity,
  ICreateCategoryData,
} from "../entities/category-entity";
import { ProductEntity, ICreateProductData } from "../entities/product-entity";

// Base query options
export interface IQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// Product filtering options (simplified)
export interface IProductFilters {
  sellerId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
}

// Category filtering options (simplified)
export interface ICategoryFilters {
  parentId?: string;
  isActive?: boolean;
  search?: string;
  level?: number;
}

// Paginated results
export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Category Repository Interface (Cleaned - Only Used Methods)
 */
export interface ICategoryRepository {
  // Currently used methods
  create(categoryData: ICreateCategoryData): Promise<CategoryEntity>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;

  // Methods needed by page-data-management
  findAll(options?: IQueryOptions): Promise<IPaginatedResult<CategoryEntity>>;
  findRootCategories(options?: IQueryOptions): Promise<CategoryEntity[]>;

  // TODO: Add back other methods when implementing full category management
}

/**
 * Product Repository Interface (Cleaned - Only Used Methods)
 */
export interface IProductRepository {
  // Currently used methods
  create(productData: ICreateProductData): Promise<ProductEntity>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findBySku(sku: string): Promise<ProductEntity | null>;
  incrementViewCount(productId: string): Promise<void>;

  // Methods needed by page-data-management
  findAll(options?: IQueryOptions): Promise<IPaginatedResult<ProductEntity>>;

  // TODO: Add back other methods when implementing full product management
}

// Remove ProductVariant interface - not currently used
// TODO: Add back IProductVariantRepository when implementing variants
