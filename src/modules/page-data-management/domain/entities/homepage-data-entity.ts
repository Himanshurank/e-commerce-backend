/**
 * Homepage Data Entity
 * Represents the complete data structure for homepage
 */

export interface IHomepageCategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | undefined;
  image?: string | undefined;
  productCount: number;
}

export interface IHomepageProductData {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  discountPrice?: number | undefined;
  currency: string;
  images: string[];
  categoryName: string;
  sellerName: string;
  sellerRating?: number | undefined;
  viewCount: number;
  salesCount: number;
  rating?: number | undefined;
  reviewCount?: number | undefined;
}

export interface IHomepageProductSections {
  featured: IHomepageProductData[];
}

export interface IHomepageMetadata {
  totalCategories: number;
  totalProducts: number;
  lastUpdated: Date;
  cacheExpiry?: Date | undefined;
}

export interface IHomepageDataEntity {
  categories: IHomepageCategoryData[];
  products: IHomepageProductSections;
  metadata: IHomepageMetadata;
}

export class HomepageDataEntity implements IHomepageDataEntity {
  public readonly categories: IHomepageCategoryData[];
  public readonly products: IHomepageProductSections;
  public readonly metadata: IHomepageMetadata;

  constructor(data: IHomepageDataEntity) {
    this.categories = data.categories;
    this.products = data.products;
    this.metadata = data.metadata;
  }
}
