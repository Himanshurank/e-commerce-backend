/**
 * Product Management Domain Interfaces
 * Repository interfaces following Clean Architecture principles
 */

import {
  CategoryEntity,
  ICreateCategoryData,
  IUpdateCategoryData,
} from "../entities/category-entity";
import {
  ProductEntity,
  ICreateProductData,
  IUpdateProductData,
} from "../entities/product-entity";
import {
  ProductVariantEntity,
  ICreateProductVariantData,
  IUpdateProductVariantData,
} from "../entities/product-variant-entity";

// Base query options
export interface IQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// Product filtering options
export interface IProductFilters {
  sellerId?: string;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
}

// Category filtering options
export interface ICategoryFilters {
  parentId?: string;
  level?: number;
  isActive?: boolean;
  search?: string;
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
 * Category Repository Interface
 */
export interface ICategoryRepository {
  // Basic CRUD operations
  create(categoryData: ICreateCategoryData): Promise<CategoryEntity>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  update(id: string, updateData: IUpdateCategoryData): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;

  // Query operations
  findAll(options?: IQueryOptions): Promise<IPaginatedResult<CategoryEntity>>;
  findByFilters(
    filters: ICategoryFilters,
    options?: IQueryOptions
  ): Promise<IPaginatedResult<CategoryEntity>>;

  // Hierarchy operations
  findChildren(
    parentId: string,
    options?: IQueryOptions
  ): Promise<CategoryEntity[]>;
  findRootCategories(options?: IQueryOptions): Promise<CategoryEntity[]>;
  findCategoryTree(): Promise<CategoryEntity[]>;

  // Utility operations
  exists(id: string): Promise<boolean>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  updateSortOrder(categoryId: string, sortOrder: number): Promise<void>;
}

/**
 * Product Repository Interface
 */
export interface IProductRepository {
  // Basic CRUD operations
  create(productData: ICreateProductData): Promise<ProductEntity>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findBySku(sku: string): Promise<ProductEntity | null>;
  update(id: string, updateData: IUpdateProductData): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;

  // Query operations
  findAll(options?: IQueryOptions): Promise<IPaginatedResult<ProductEntity>>;
  findByFilters(
    filters: IProductFilters,
    options?: IQueryOptions
  ): Promise<IPaginatedResult<ProductEntity>>;
  findBySeller(
    sellerId: string,
    options?: IQueryOptions
  ): Promise<IPaginatedResult<ProductEntity>>;
  findByCategory(
    categoryId: string,
    options?: IQueryOptions
  ): Promise<IPaginatedResult<ProductEntity>>;

  // Search operations
  search(
    query: string,
    filters?: IProductFilters,
    options?: IQueryOptions
  ): Promise<IPaginatedResult<ProductEntity>>;
  findRelatedProducts(
    productId: string,
    limit?: number
  ): Promise<ProductEntity[]>;
  findFeaturedProducts(limit?: number): Promise<ProductEntity[]>;

  // Stock operations
  updateStock(productId: string, quantity: number): Promise<void>;
  reserveStock(productId: string, quantity: number): Promise<boolean>;
  releaseStock(productId: string, quantity: number): Promise<void>;
  findLowStockProducts(sellerId?: string): Promise<ProductEntity[]>;

  // Analytics operations
  incrementViewCount(productId: string): Promise<void>;
  updateRating(
    productId: string,
    averageRating: number,
    reviewCount: number
  ): Promise<void>;

  // Utility operations
  exists(id: string): Promise<boolean>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  skuExists(sku: string, excludeId?: string): Promise<boolean>;
  countByFilters(filters: IProductFilters): Promise<number>;
}

/**
 * Product Variant Repository Interface
 */
export interface IProductVariantRepository {
  // Basic CRUD operations
  create(variantData: ICreateProductVariantData): Promise<ProductVariantEntity>;
  findById(id: string): Promise<ProductVariantEntity | null>;
  findBySku(sku: string): Promise<ProductVariantEntity | null>;
  update(
    id: string,
    updateData: IUpdateProductVariantData
  ): Promise<ProductVariantEntity>;
  delete(id: string): Promise<void>;

  // Query operations
  findByProduct(productId: string): Promise<ProductVariantEntity[]>;
  findActiveByProduct(productId: string): Promise<ProductVariantEntity[]>;

  // Stock operations
  updateStock(variantId: string, quantity: number): Promise<void>;
  reserveStock(variantId: string, quantity: number): Promise<boolean>;
  releaseStock(variantId: string, quantity: number): Promise<void>;

  // Utility operations
  exists(id: string): Promise<boolean>;
  skuExists(sku: string, excludeId?: string): Promise<boolean>;
  deleteByProduct(productId: string): Promise<void>;
}

/**
 * Product Search Service Interface (for future Elasticsearch integration)
 */
export interface IProductSearchService {
  indexProduct(product: ProductEntity): Promise<void>;
  updateProduct(product: ProductEntity): Promise<void>;
  deleteProduct(productId: string): Promise<void>;
  search(
    query: string,
    filters?: IProductFilters,
    options?: IQueryOptions
  ): Promise<IPaginatedResult<ProductEntity>>;
  suggest(query: string, limit?: number): Promise<string[]>;
  reindexAll(): Promise<void>;
}

/**
 * Image Upload Service Interface
 */
export interface IImageUploadService {
  uploadImage(file: Buffer, fileName: string, folder?: string): Promise<string>;
  uploadMultipleImages(
    files: Array<{ buffer: Buffer; fileName: string }>,
    folder?: string
  ): Promise<string[]>;
  deleteImage(url: string): Promise<void>;
  deleteMultipleImages(urls: string[]): Promise<void>;
  generateThumbnail(
    imageUrl: string,
    width: number,
    height: number
  ): Promise<string>;
}

/**
 * Product Domain Service Interface
 */
export interface IProductDomainService {
  validateProductData(productData: ICreateProductData): Promise<string[]>;
  generateSlug(name: string, existingSlug?: string): Promise<string>;
  generateSku(productName: string, sellerId: string): Promise<string>;
  calculateDiscountPercentage(price: number, comparePrice: number): number;
  validateProductImages(images: any[]): string[];
  processProductImages(images: any[], productId: string): Promise<any[]>;
}
