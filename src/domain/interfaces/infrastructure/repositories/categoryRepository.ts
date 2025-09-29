import { Category } from "../../../entities/catalog/category";

export interface ICategoryRepository {
  /**
   * Get all active root categories (parent_id is null) ordered by sort_order
   */
  findRootCategories(): Promise<Category[]>;

  /**
   * Get all active categories with their hierarchy
   */
  findAllActiveCategories(): Promise<Category[]>;

  /**
   * Find category by ID
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find category by slug
   */
  findBySlug(slug: string): Promise<Category | null>;

  /**
   * Get child categories for a parent category
   */
  findChildCategories(parentId: string): Promise<Category[]>;

  /**
   * Get featured categories for homepage (limited number)
   */
  findFeaturedCategories(limit?: number): Promise<Category[]>;
}
