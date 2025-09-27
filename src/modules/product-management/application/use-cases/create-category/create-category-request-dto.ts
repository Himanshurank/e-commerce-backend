/**
 * Create Category Request DTO
 * Data Transfer Object for creating a category
 */

export interface ICreateCategoryRequestDto {
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

export class CreateCategoryRequestDto implements ICreateCategoryRequestDto {
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | undefined;
  public readonly imageUrl: string | undefined;
  public readonly parentId: string | undefined;
  public readonly sortOrder: number | undefined;
  public readonly seoTitle: string | undefined;
  public readonly seoDescription: string | undefined;
  public readonly seoKeywords: string | undefined;
  public readonly isActive: boolean | undefined;

  constructor(data: ICreateCategoryRequestDto) {
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.parentId = data.parentId;
    this.sortOrder = data.sortOrder;
    this.seoTitle = data.seoTitle;
    this.seoDescription = data.seoDescription;
    this.seoKeywords = data.seoKeywords;
    this.isActive = data.isActive;

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error("Category slug is required");
    }

    if (this.name.length > 100) {
      throw new Error("Category name must be 100 characters or less");
    }

    if (this.slug.length > 100) {
      throw new Error("Category slug must be 100 characters or less");
    }

    if (this.sortOrder !== undefined && this.sortOrder < 0) {
      throw new Error("Sort order must be non-negative");
    }

    // Validate slug format (kebab-case)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(this.slug)) {
      throw new Error("Category slug must be in kebab-case format");
    }
  }
}
