import { TProductRecord } from "../../repositories/productRepository";
import { ProductStatus } from "../../enum/productStatus";
import { ProductVisibility } from "../../enum/productVisibility";

interface Props {
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
  barcode: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight: number | null;
  dimensions: any | null;
  images: any | null;
  videoUrl: string | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  password: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  tags: any | null;
  attributes: any | null;
  viewCount: number;
  favoriteCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Product {
  private readonly _id: string;
  private readonly _sellerId: string;
  private readonly _categoryId: string | null;
  private readonly _name: string;
  private readonly _slug: string;
  private readonly _description: string | null;
  private readonly _shortDescription: string | null;
  private readonly _price: number;
  private readonly _comparePrice: number | null;
  private readonly _costPrice: number | null;
  private readonly _sku: string | null;
  private readonly _barcode: string | null;
  private readonly _stockQuantity: number;
  private readonly _lowStockThreshold: number;
  private readonly _trackInventory: boolean;
  private readonly _allowBackorders: boolean;
  private readonly _weight: number | null;
  private readonly _dimensions: any | null;
  private readonly _images: any | null;
  private readonly _videoUrl: string | null;
  private readonly _status: ProductStatus;
  private readonly _visibility: ProductVisibility;
  private readonly _password: string | null;
  private readonly _seoTitle: string | null;
  private readonly _seoDescription: string | null;
  private readonly _seoKeywords: string | null;
  private readonly _tags: any | null;
  private readonly _attributes: any | null;
  private readonly _viewCount: number;
  private readonly _favoriteCount: number;
  private readonly _averageRating: number;
  private readonly _reviewCount: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;

  constructor({
    id,
    sellerId,
    categoryId,
    name,
    slug,
    description,
    shortDescription,
    price,
    comparePrice,
    costPrice,
    sku,
    barcode,
    stockQuantity,
    lowStockThreshold,
    trackInventory,
    allowBackorders,
    weight,
    dimensions,
    images,
    videoUrl,
    status,
    visibility,
    password,
    seoTitle,
    seoDescription,
    seoKeywords,
    tags,
    attributes,
    viewCount,
    favoriteCount,
    averageRating,
    reviewCount,
    createdAt,
    updatedAt,
    deletedAt,
  }: Props) {
    this._id = id;
    this._sellerId = sellerId;
    this._categoryId = categoryId;
    this._name = name;
    this._slug = slug;
    this._description = description;
    this._shortDescription = shortDescription;
    this._price = price;
    this._comparePrice = comparePrice;
    this._costPrice = costPrice;
    this._sku = sku;
    this._barcode = barcode;
    this._stockQuantity = stockQuantity;
    this._lowStockThreshold = lowStockThreshold;
    this._trackInventory = trackInventory;
    this._allowBackorders = allowBackorders;
    this._weight = weight;
    this._dimensions = dimensions;
    this._images = images;
    this._videoUrl = videoUrl;
    this._status = status;
    this._visibility = visibility;
    this._password = password;
    this._seoTitle = seoTitle;
    this._seoDescription = seoDescription;
    this._seoKeywords = seoKeywords;
    this._tags = tags;
    this._attributes = attributes;
    this._viewCount = viewCount;
    this._favoriteCount = favoriteCount;
    this._averageRating = averageRating;
    this._reviewCount = reviewCount;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;

    this.validate();
  }

  // Static factory for database records
  static create(params: TProductRecord): Product {
    return new Product({
      id: params.id,
      sellerId: params.seller_id,
      categoryId: params.category_id,
      name: params.name,
      slug: params.slug,
      description: params.description,
      shortDescription: params.short_description,
      price: params.price,
      comparePrice: params.compare_price,
      costPrice: params.cost_price,
      sku: params.sku,
      barcode: params.barcode,
      stockQuantity: params.stock_quantity,
      lowStockThreshold: params.low_stock_threshold,
      trackInventory: params.track_inventory,
      allowBackorders: params.allow_backorders,
      weight: params.weight,
      dimensions: params.dimensions,
      images: params.images,
      videoUrl: params.video_url,
      status: params.status,
      visibility: params.visibility,
      password: params.password,
      seoTitle: params.seo_title,
      seoDescription: params.seo_description,
      seoKeywords: params.seo_keywords,
      tags: params.tags,
      attributes: params.attributes,
      viewCount: params.view_count,
      favoriteCount: params.favorite_count,
      averageRating: params.average_rating,
      reviewCount: params.review_count,
      createdAt: params.created_at,
      updatedAt: params.updated_at,
      deletedAt: params.deleted_at,
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get sellerId(): string {
    return this._sellerId;
  }
  get categoryId(): string | null {
    return this._categoryId;
  }
  get name(): string {
    return this._name;
  }
  get slug(): string {
    return this._slug;
  }
  get description(): string | null {
    return this._description;
  }
  get shortDescription(): string | null {
    return this._shortDescription;
  }
  get price(): number {
    return this._price;
  }
  get comparePrice(): number | null {
    return this._comparePrice;
  }
  get costPrice(): number | null {
    return this._costPrice;
  }
  get sku(): string | null {
    return this._sku;
  }
  get barcode(): string | null {
    return this._barcode;
  }
  get stockQuantity(): number {
    return this._stockQuantity;
  }
  get lowStockThreshold(): number {
    return this._lowStockThreshold;
  }
  get trackInventory(): boolean {
    return this._trackInventory;
  }
  get allowBackorders(): boolean {
    return this._allowBackorders;
  }
  get weight(): number | null {
    return this._weight;
  }
  get dimensions(): any | null {
    return this._dimensions;
  }
  get images(): any | null {
    return this._images;
  }
  get videoUrl(): string | null {
    return this._videoUrl;
  }
  get status(): ProductStatus {
    return this._status;
  }
  get visibility(): ProductVisibility {
    return this._visibility;
  }
  get password(): string | null {
    return this._password;
  }
  get seoTitle(): string | null {
    return this._seoTitle;
  }
  get seoDescription(): string | null {
    return this._seoDescription;
  }
  get seoKeywords(): string | null {
    return this._seoKeywords;
  }
  get tags(): any | null {
    return this._tags;
  }
  get attributes(): any | null {
    return this._attributes;
  }
  get viewCount(): number {
    return this._viewCount;
  }
  get favoriteCount(): number {
    return this._favoriteCount;
  }
  get averageRating(): number {
    return this._averageRating;
  }
  get reviewCount(): number {
    return this._reviewCount;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // Business methods
  public isAvailable(): boolean {
    return (
      this._status === ProductStatus.ACTIVE &&
      this._stockQuantity > 0 &&
      !this._deletedAt &&
      this._visibility === ProductVisibility.PUBLIC
    );
  }

  public isLowStock(): boolean {
    return this._stockQuantity <= this._lowStockThreshold;
  }

  public isVisible(): boolean {
    return (
      this._visibility === ProductVisibility.PUBLIC &&
      this._status === ProductStatus.ACTIVE &&
      !this._deletedAt
    );
  }

  public hasDiscount(): boolean {
    return this._comparePrice !== null && this._comparePrice > this._price;
  }

  public getDiscountPercentage(): number {
    if (!this.hasDiscount() || !this._comparePrice) {
      return 0;
    }
    return Math.round(
      ((this._comparePrice - this._price) / this._comparePrice) * 100
    );
  }

  public getPrimaryImage(): string | null {
    if (
      !this._images ||
      !Array.isArray(this._images) ||
      this._images.length === 0
    ) {
      return null;
    }
    return this._images[0]?.url || null;
  }

  private validate(): void {
    if (!this._id || this._id.trim() === "") {
      throw new Error("Product ID is required");
    }

    if (!this._sellerId || this._sellerId.trim() === "") {
      throw new Error("Product seller ID is required");
    }

    if (!this._name || this._name.trim() === "") {
      throw new Error("Product name is required");
    }

    if (!this._slug || this._slug.trim() === "") {
      throw new Error("Product slug is required");
    }

    if (this._price < 0) {
      throw new Error("Product price must be non-negative");
    }

    // Compare price validation - only validate if compare_price is set and should represent original price
    // In e-commerce, compare_price is typically the "was" price, so it should be higher than current price
    // But we'll make this more lenient to handle edge cases
    if (this._comparePrice !== null && this._comparePrice < 0) {
      throw new Error("Compare price must be non-negative");
    }

    if (this._stockQuantity < 0) {
      throw new Error("Stock quantity must be non-negative");
    }

    if (this._averageRating < 0 || this._averageRating > 5) {
      throw new Error("Average rating must be between 0 and 5");
    }
  }
}
