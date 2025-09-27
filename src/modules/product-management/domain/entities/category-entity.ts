/**
 * Category Domain Entity
 * Represents a product category with hierarchical support
 */

export interface ICategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string | undefined;
  imageUrl: string | undefined;

  // Hierarchy Support
  parentId: string | undefined;
  level: number;
  sortOrder: number;

  // SEO Properties
  seoTitle: string | undefined;
  seoDescription: string | undefined;
  seoKeywords: string | undefined;

  // Status
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryEntity implements ICategoryEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | undefined;
  public readonly imageUrl: string | undefined;

  // Hierarchy Support
  public readonly parentId: string | undefined;
  public readonly level: number;
  public readonly sortOrder: number;

  // SEO Properties
  public readonly seoTitle: string | undefined;
  public readonly seoDescription: string | undefined;
  public readonly seoKeywords: string | undefined;

  // Status
  public readonly isActive: boolean;

  // Timestamps
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: ICategoryEntity) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.parentId = data.parentId;
    this.level = data.level;
    this.sortOrder = data.sortOrder;
    this.seoTitle = data.seoTitle;
    this.seoDescription = data.seoDescription;
    this.seoKeywords = data.seoKeywords;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error("Category slug is required");
    }

    if (this.level < 0) {
      throw new Error("Category level must be non-negative");
    }

    if (this.sortOrder < 0) {
      throw new Error("Category sort order must be non-negative");
    }

    // Validate slug format (kebab-case)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(this.slug)) {
      throw new Error("Category slug must be in kebab-case format");
    }
  }

  /**
   * Check if this category is a root category
   */
  public isRootCategory(): boolean {
    return !this.parentId && this.level === 0;
  }

  /**
   * Check if this category is a child category
   */
  public isChildCategory(): boolean {
    return !!this.parentId && this.level > 0;
  }

  /**
   * Get display name for admin interface
   */
  public getDisplayName(): string {
    const indent = "  ".repeat(this.level);
    return `${indent}${this.name}`;
  }

  /**
   * Create a new category with updated properties
   */
  public update(
    updates: Partial<Omit<ICategoryEntity, "id" | "createdAt">>
  ): CategoryEntity {
    return new CategoryEntity({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }
}

// Category creation data transfer object
export interface ICreateCategoryData {
  name: string;
  slug: string;
  description: string | undefined;
  imageUrl: string | undefined;
  parentId: string | undefined;
  sortOrder: number | undefined;
  seoTitle: string | undefined;
  seoDescription: string | undefined;
  seoKeywords: string | undefined;
  isActive: boolean | undefined;
}

// Category update data transfer object
export interface IUpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isActive?: boolean;
}
