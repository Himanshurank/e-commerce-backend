/**
 * Product Repository Interface for Page Data Module
 * Simplified interface focusing on homepage needs
 */

export interface IProductFilters {
  status?: "ACTIVE" | "INACTIVE" | "DRAFT" | undefined;
  visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
  sortBy?:
    | "name"
    | "price"
    | "created_at"
    | "view_count"
    | "sales_count"
    | "featured_priority"
    | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  includeSellerInfo?: boolean | undefined;
  includeCategoryInfo?: boolean | undefined;
}

export interface IProductWithDetails {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  discountPrice?: number | undefined;
  currency: string;
  images?: string[] | undefined;
  viewCount?: number | undefined;
  salesCount?: number | undefined;
  averageRating?: number | undefined;
  reviewCount?: number | undefined;
  isPromoted?: boolean | undefined;
  categoryName?: string | undefined;
  sellerName?: string | undefined;
  sellerRating?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductRepository {
  /**
   * Find products with optional filters
   */
  findAll(
    filters?: IProductFilters | undefined
  ): Promise<IProductWithDetails[]>;

  /**
   * Count products with optional filters
   */
  count(
    filters?:
      | {
          status?: "ACTIVE" | "INACTIVE" | "DRAFT" | undefined;
          visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
        }
      | undefined
  ): Promise<number>;
}
