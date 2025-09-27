/**
 * Create Product Request DTO
 * Data Transfer Object for creating a product
 */

import {
  ProductStatus,
  ProductVisibility,
  IProductImage,
  IProductDimensions,
} from "../../../domain/entities/product-entity";

export interface ICreateProductRequestDto {
  sellerId: string;
  categoryId: string | undefined;
  name: string;
  slug: string;
  description: string | undefined;
  shortDescription: string | undefined;
  price: number;
  comparePrice: number | undefined;
  costPrice: number | undefined;
  sku: string | undefined;
  stockQuantity: number | undefined;
  lowStockThreshold: number | undefined;
  trackInventory: boolean | undefined;
  allowBackorders: boolean | undefined;
  weight: number | undefined;
  dimensions: IProductDimensions | undefined;
  images: IProductImage[] | undefined;
  videoUrl: string | undefined;
  status: ProductStatus | undefined;
  visibility: ProductVisibility | undefined;
  password: string | undefined;
  seoTitle: string | undefined;
  seoDescription: string | undefined;
  seoKeywords: string | undefined;
  tags: string[] | undefined;
  attributes: Record<string, any> | undefined;
}

export class CreateProductRequestDto implements ICreateProductRequestDto {
  public readonly sellerId: string;
  public readonly categoryId: string | undefined;
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | undefined;
  public readonly shortDescription: string | undefined;
  public readonly price: number;
  public readonly comparePrice: number | undefined;
  public readonly costPrice: number | undefined;
  public readonly sku: string | undefined;
  public readonly stockQuantity: number | undefined;
  public readonly lowStockThreshold: number | undefined;
  public readonly trackInventory: boolean | undefined;
  public readonly allowBackorders: boolean | undefined;
  public readonly weight: number | undefined;
  public readonly dimensions: IProductDimensions | undefined;
  public readonly images: IProductImage[] | undefined;
  public readonly videoUrl: string | undefined;
  public readonly status: ProductStatus | undefined;
  public readonly visibility: ProductVisibility | undefined;
  public readonly password: string | undefined;
  public readonly seoTitle: string | undefined;
  public readonly seoDescription: string | undefined;
  public readonly seoKeywords: string | undefined;
  public readonly tags: string[] | undefined;
  public readonly attributes: Record<string, any> | undefined;

  constructor(data: ICreateProductRequestDto) {
    this.sellerId = data.sellerId;
    this.categoryId = data.categoryId;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.shortDescription = data.shortDescription;
    this.price = data.price;
    this.comparePrice = data.comparePrice;
    this.costPrice = data.costPrice;
    this.sku = data.sku;
    this.stockQuantity = data.stockQuantity;
    this.lowStockThreshold = data.lowStockThreshold;
    this.trackInventory = data.trackInventory;
    this.allowBackorders = data.allowBackorders;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.images = data.images;
    this.videoUrl = data.videoUrl;
    this.status = data.status;
    this.visibility = data.visibility;
    this.password = data.password;
    this.seoTitle = data.seoTitle;
    this.seoDescription = data.seoDescription;
    this.seoKeywords = data.seoKeywords;
    this.tags = data.tags;
    this.attributes = data.attributes;

    this.validate();
  }

  private validate(): void {
    if (!this.sellerId || this.sellerId.trim().length === 0) {
      throw new Error("Seller ID is required");
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Product name is required");
    }

    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error("Product slug is required");
    }

    if (this.price < 0) {
      throw new Error("Product price must be non-negative");
    }

    if (this.comparePrice !== undefined && this.comparePrice < 0) {
      throw new Error("Compare price must be non-negative");
    }

    if (this.costPrice !== undefined && this.costPrice < 0) {
      throw new Error("Cost price must be non-negative");
    }

    if (this.stockQuantity !== undefined && this.stockQuantity < 0) {
      throw new Error("Stock quantity must be non-negative");
    }

    if (this.lowStockThreshold !== undefined && this.lowStockThreshold < 0) {
      throw new Error("Low stock threshold must be non-negative");
    }

    if (this.weight !== undefined && this.weight < 0) {
      throw new Error("Weight must be non-negative");
    }

    if (this.name.length > 255) {
      throw new Error("Product name must be 255 characters or less");
    }

    if (this.slug.length > 255) {
      throw new Error("Product slug must be 255 characters or less");
    }

    // Validate slug format (kebab-case)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(this.slug)) {
      throw new Error("Product slug must be in kebab-case format");
    }

    // Validate images limit
    if (this.images && this.images.length > 5) {
      throw new Error("Product can have maximum 5 images");
    }

    // Validate password visibility
    if (
      this.visibility === ProductVisibility.PASSWORD_PROTECTED &&
      !this.password
    ) {
      throw new Error("Password is required for password-protected products");
    }
  }
}
