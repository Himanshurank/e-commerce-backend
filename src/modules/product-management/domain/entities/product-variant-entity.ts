/**
 * Product Variant Domain Entity
 * Represents a variant of a product (e.g., different size, color)
 */

export interface IProductVariantEntity {
  id: string;
  productId: string;

  // Variant Details
  name: string;
  sku: string | undefined;

  // Pricing Override (optional - uses parent product if not set)
  price: number | undefined;
  comparePrice: number | undefined;
  costPrice: number | undefined;

  // Inventory Override
  stockQuantity: number;

  // Physical Properties Override
  weight: number | undefined;
  dimensions:
    | {
        length?: number;
        width?: number;
        height?: number;
        unit?: "cm" | "inch";
      }
    | undefined;

  // Media Override
  imageUrl: string | undefined;

  // Attributes (size, color, etc.)
  attributes: Record<string, any>;

  // Status
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class ProductVariantEntity implements IProductVariantEntity {
  public readonly id: string;
  public readonly productId: string;

  // Variant Details
  public readonly name: string;
  public readonly sku: string | undefined;

  // Pricing Override
  public readonly price: number | undefined;
  public readonly comparePrice: number | undefined;
  public readonly costPrice: number | undefined;

  // Inventory Override
  public readonly stockQuantity: number;

  // Physical Properties Override
  public readonly weight: number | undefined;
  public readonly dimensions:
    | {
        length?: number;
        width?: number;
        height?: number;
        unit?: "cm" | "inch";
      }
    | undefined;

  // Media Override
  public readonly imageUrl: string | undefined;

  // Attributes
  public readonly attributes: Record<string, any>;

  // Status
  public readonly isActive: boolean;

  // Timestamps
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: IProductVariantEntity) {
    this.id = data.id;
    this.productId = data.productId;
    this.name = data.name;
    this.sku = data.sku;
    this.price = data.price;
    this.comparePrice = data.comparePrice;
    this.costPrice = data.costPrice;
    this.stockQuantity = data.stockQuantity;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.imageUrl = data.imageUrl;
    this.attributes = data.attributes;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Product variant name is required");
    }

    if (!this.productId || this.productId.trim().length === 0) {
      throw new Error("Product variant product ID is required");
    }

    if (this.price && this.price < 0) {
      throw new Error("Product variant price must be non-negative");
    }

    if (this.comparePrice && this.comparePrice < 0) {
      throw new Error("Product variant compare price must be non-negative");
    }

    if (this.costPrice && this.costPrice < 0) {
      throw new Error("Product variant cost price must be non-negative");
    }

    if (this.stockQuantity < 0) {
      throw new Error("Product variant stock quantity must be non-negative");
    }

    if (this.weight && this.weight < 0) {
      throw new Error("Product variant weight must be non-negative");
    }
  }

  /**
   * Check if variant is available for purchase
   */
  public isAvailable(): boolean {
    return this.isActive && this.stockQuantity > 0;
  }

  /**
   * Check if variant is out of stock
   */
  public isOutOfStock(): boolean {
    return this.stockQuantity <= 0;
  }

  /**
   * Check if variant has custom pricing
   */
  public hasCustomPricing(): boolean {
    return this.price !== undefined;
  }

  /**
   * Get effective price (variant price or falls back to product price)
   */
  public getEffectivePrice(productPrice: number): number {
    return this.price ?? productPrice;
  }

  /**
   * Get effective compare price
   */
  public getEffectiveComparePrice(
    productComparePrice?: number
  ): number | undefined {
    return this.comparePrice ?? productComparePrice;
  }

  /**
   * Check if variant is on sale
   */
  public isOnSale(productPrice: number, productComparePrice?: number): boolean {
    const effectivePrice = this.getEffectivePrice(productPrice);
    const effectiveComparePrice =
      this.getEffectiveComparePrice(productComparePrice);

    return !!effectiveComparePrice && effectiveComparePrice > effectivePrice;
  }

  /**
   * Get discount percentage
   */
  public getDiscountPercentage(
    productPrice: number,
    productComparePrice?: number
  ): number {
    if (!this.isOnSale(productPrice, productComparePrice)) {
      return 0;
    }

    const effectivePrice = this.getEffectivePrice(productPrice);
    const effectiveComparePrice =
      this.getEffectiveComparePrice(productComparePrice)!;

    return Math.round(
      ((effectiveComparePrice - effectivePrice) / effectiveComparePrice) * 100
    );
  }

  /**
   * Get attribute value by key
   */
  public getAttribute(key: string): any {
    return this.attributes[key];
  }

  /**
   * Check if variant has specific attribute
   */
  public hasAttribute(key: string): boolean {
    return key in this.attributes;
  }

  /**
   * Get variant display name with attributes
   */
  public getDisplayName(): string {
    const attributeValues = Object.values(this.attributes)
      .filter((value) => value)
      .join(" / ");
    return attributeValues ? `${this.name} (${attributeValues})` : this.name;
  }

  /**
   * Create a new variant with updated properties
   */
  public update(
    updates: Partial<
      Omit<IProductVariantEntity, "id" | "productId" | "createdAt">
    >
  ): ProductVariantEntity {
    return new ProductVariantEntity({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Deactivate variant
   */
  public deactivate(): ProductVariantEntity {
    return new ProductVariantEntity({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }
}

// Product variant creation data transfer object
export interface ICreateProductVariantData {
  productId: string;
  name: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "cm" | "inch";
  };
  imageUrl?: string;
  attributes?: Record<string, any>;
  isActive?: boolean;
}

// Product variant update data transfer object
export interface IUpdateProductVariantData {
  name?: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "cm" | "inch";
  };
  imageUrl?: string;
  attributes?: Record<string, any>;
  isActive?: boolean;
}
