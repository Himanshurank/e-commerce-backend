/**
 * Create Product Response DTO
 * Data Transfer Object for product creation response
 */

import {
  ProductStatus,
  ProductVisibility,
  IProductImage,
  IProductDimensions,
} from "../../../domain/entities/product-entity";

export interface ICreateProductResponseDto {
  id: string;
  sellerId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight: number | null;
  dimensions: IProductDimensions | null;
  images: IProductImage[];
  videoUrl: string | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  tags: string[];
  attributes: Record<string, any>;
  viewCount: number;
  favoriteCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export class CreateProductResponseDto implements ICreateProductResponseDto {
  public readonly id: string;
  public readonly sellerId: string;
  public readonly categoryId: string | null;
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | null;
  public readonly shortDescription: string | null;
  public readonly price: number;
  public readonly comparePrice: number | null;
  public readonly costPrice: number | null;
  public readonly sku: string | null;
  public readonly stockQuantity: number;
  public readonly lowStockThreshold: number;
  public readonly trackInventory: boolean;
  public readonly allowBackorders: boolean;
  public readonly weight: number | null;
  public readonly dimensions: IProductDimensions | null;
  public readonly images: IProductImage[];
  public readonly videoUrl: string | null;
  public readonly status: ProductStatus;
  public readonly visibility: ProductVisibility;
  public readonly seoTitle: string | null;
  public readonly seoDescription: string | null;
  public readonly seoKeywords: string | null;
  public readonly tags: string[];
  public readonly attributes: Record<string, any>;
  public readonly viewCount: number;
  public readonly favoriteCount: number;
  public readonly averageRating: number;
  public readonly reviewCount: number;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(data: ICreateProductResponseDto) {
    this.id = data.id;
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
    this.seoTitle = data.seoTitle;
    this.seoDescription = data.seoDescription;
    this.seoKeywords = data.seoKeywords;
    this.tags = data.tags;
    this.attributes = data.attributes;
    this.viewCount = data.viewCount;
    this.favoriteCount = data.favoriteCount;
    this.averageRating = data.averageRating;
    this.reviewCount = data.reviewCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
