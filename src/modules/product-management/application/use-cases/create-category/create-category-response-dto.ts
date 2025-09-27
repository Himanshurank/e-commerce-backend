/**
 * Create Category Response DTO
 * Data Transfer Object for category creation response
 */

export interface ICreateCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CreateCategoryResponseDto implements ICreateCategoryResponseDto {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | null;
  public readonly imageUrl: string | null;
  public readonly parentId: string | null;
  public readonly level: number;
  public readonly sortOrder: number;
  public readonly seoTitle: string | null;
  public readonly seoDescription: string | null;
  public readonly seoKeywords: string | null;
  public readonly isActive: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(data: ICreateCategoryResponseDto) {
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
  }
}
