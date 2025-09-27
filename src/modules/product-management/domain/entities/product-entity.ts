/**
 * Product Domain Entity
 * Represents a product with all its properties and business logic
 */

export enum ProductStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
}

export enum ProductVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  PASSWORD_PROTECTED = "password_protected",
}

export interface IProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "inch";
}

export interface IProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isMain: boolean;
}

export interface IProductEntity {
  id: string;
  sellerId: string;
  categoryId: string | undefined;

  // Basic Information
  name: string;
  slug: string;
  description: string | undefined;
  shortDescription: string | undefined;

  // Pricing
  price: number;
  comparePrice: number | undefined;
  costPrice: number | undefined;

  // Inventory
  sku: string | undefined;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;

  // Physical Properties
  weight: number | undefined;
  dimensions: IProductDimensions | undefined;

  // Media
  images: IProductImage[];
  videoUrl: string | undefined;

  // Status & Visibility
  status: ProductStatus;
  visibility: ProductVisibility;
  password: string | undefined;

  // SEO
  seoTitle: string | undefined;
  seoDescription: string | undefined;
  seoKeywords: string | undefined;

  // Additional Data
  tags: string[];
  attributes: Record<string, any>;

  // Analytics
  viewCount: number;
  favoriteCount: number;

  // Reviews
  averageRating: number;
  reviewCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | undefined;
}

export class ProductEntity implements IProductEntity {
  public readonly id: string;
  public readonly sellerId: string;
  public readonly categoryId: string | undefined;

  // Basic Information
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | undefined;
  public readonly shortDescription: string | undefined;

  // Pricing
  public readonly price: number;
  public readonly comparePrice: number | undefined;
  public readonly costPrice: number | undefined;

  // Inventory
  public readonly sku: string | undefined;
  public readonly stockQuantity: number;
  public readonly lowStockThreshold: number;
  public readonly trackInventory: boolean;
  public readonly allowBackorders: boolean;

  // Physical Properties
  public readonly weight: number | undefined;
  public readonly dimensions: IProductDimensions | undefined;

  // Media
  public readonly images: IProductImage[];
  public readonly videoUrl: string | undefined;

  // Status & Visibility
  public readonly status: ProductStatus;
  public readonly visibility: ProductVisibility;
  public readonly password: string | undefined;

  // SEO
  public readonly seoTitle: string | undefined;
  public readonly seoDescription: string | undefined;
  public readonly seoKeywords: string | undefined;

  // Additional Data
  public readonly tags: string[];
  public readonly attributes: Record<string, any>;

  // Analytics
  public readonly viewCount: number;
  public readonly favoriteCount: number;

  // Reviews
  public readonly averageRating: number;
  public readonly reviewCount: number;

  // Timestamps
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | undefined;

  constructor(data: IProductEntity) {
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
    this.password = data.password;
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
    this.deletedAt = data.deletedAt;

    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Product name is required");
    }

    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error("Product slug is required");
    }

    if (!this.sellerId || this.sellerId.trim().length === 0) {
      throw new Error("Product seller ID is required");
    }

    if (this.price < 0) {
      throw new Error("Product price must be non-negative");
    }

    if (this.comparePrice && this.comparePrice < 0) {
      throw new Error("Product compare price must be non-negative");
    }

    if (this.costPrice && this.costPrice < 0) {
      throw new Error("Product cost price must be non-negative");
    }

    if (this.stockQuantity < 0) {
      throw new Error("Product stock quantity must be non-negative");
    }

    if (this.lowStockThreshold < 0) {
      throw new Error("Product low stock threshold must be non-negative");
    }

    if (this.weight && this.weight < 0) {
      throw new Error("Product weight must be non-negative");
    }

    if (this.averageRating < 0 || this.averageRating > 5) {
      throw new Error("Product average rating must be between 0 and 5");
    }

    if (this.reviewCount < 0) {
      throw new Error("Product review count must be non-negative");
    }

    if (this.viewCount < 0) {
      throw new Error("Product view count must be non-negative");
    }

    if (this.favoriteCount < 0) {
      throw new Error("Product favorite count must be non-negative");
    }

    // Validate slug format (kebab-case)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(this.slug)) {
      throw new Error("Product slug must be in kebab-case format");
    }

    // Validate images limit (max 5)
    if (this.images.length > 5) {
      throw new Error("Product can have maximum 5 images");
    }
  }

  /**
   * Check if product is available for purchase
   */
  public isAvailable(): boolean {
    if (this.status !== ProductStatus.ACTIVE) {
      return false;
    }

    if (
      this.trackInventory &&
      this.stockQuantity <= 0 &&
      !this.allowBackorders
    ) {
      return false;
    }

    return true;
  }

  /**
   * Check if product is out of stock
   */
  public isOutOfStock(): boolean {
    return this.trackInventory && this.stockQuantity <= 0;
  }

  /**
   * Check if product stock is low
   */
  public isLowStock(): boolean {
    return this.trackInventory && this.stockQuantity <= this.lowStockThreshold;
  }

  /**
   * Check if product is on sale
   */
  public isOnSale(): boolean {
    return !!this.comparePrice && this.comparePrice > this.price;
  }

  /**
   * Get discount percentage if on sale
   */
  public getDiscountPercentage(): number {
    if (!this.isOnSale() || !this.comparePrice) {
      return 0;
    }

    return Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100
    );
  }

  /**
   * Get main product image
   */
  public getMainImage(): IProductImage | undefined {
    return this.images.find((img) => img.isMain) || this.images[0];
  }

  /**
   * Get product images sorted by sort order
   */
  public getSortedImages(): IProductImage[] {
    return [...this.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Check if product belongs to seller
   */
  public belongsToSeller(sellerId: string): boolean {
    return this.sellerId === sellerId;
  }

  /**
   * Create a new product with updated properties
   */
  public update(
    updates: Partial<Omit<IProductEntity, "id" | "createdAt">>
  ): ProductEntity {
    return new ProductEntity({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Mark product as deleted (soft delete)
   */
  public markAsDeleted(): ProductEntity {
    return new ProductEntity({
      ...this,
      deletedAt: new Date(),
      status: ProductStatus.INACTIVE,
      updatedAt: new Date(),
    });
  }
}

// Product creation data transfer object
export interface ICreateProductData {
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

// Product update data transfer object
export interface IUpdateProductData {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  weight?: number;
  dimensions?: IProductDimensions;
  images?: IProductImage[];
  videoUrl?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  password?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  tags?: string[];
  attributes?: Record<string, any>;
}
