import { Category } from "../../../domain/entities/catalog/category";
import { Product } from "../../../domain/entities/catalog/product";

export class CategoryDto {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | null;
  public readonly imageUrl: string | null;
  public readonly level: number;
  public readonly sortOrder: number;

  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.imageUrl = category.imageUrl;
    this.level = category.level;
    this.sortOrder = category.sortOrder;
  }

  static fromEntity(category: Category): CategoryDto {
    return new CategoryDto(category);
  }

  static fromEntities(categories: Category[]): CategoryDto[] {
    return categories.map((category) => CategoryDto.fromEntity(category));
  }
}

export class ProductDto {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly shortDescription: string | null;
  public readonly price: number;
  public readonly comparePrice: number | null;
  public readonly primaryImage: string | null;
  public readonly averageRating: number;
  public readonly reviewCount: number;
  public readonly hasDiscount: boolean;
  public readonly discountPercentage: number;
  public readonly isAvailable: boolean;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.slug = product.slug;
    this.shortDescription = product.shortDescription;
    this.price = product.price;
    this.comparePrice = product.comparePrice;
    this.primaryImage = product.getPrimaryImage();
    this.averageRating = product.averageRating;
    this.reviewCount = product.reviewCount;
    this.hasDiscount = product.hasDiscount();
    this.discountPercentage = product.getDiscountPercentage();
    this.isAvailable = product.isAvailable();
  }

  static fromEntity(product: Product): ProductDto {
    return new ProductDto(product);
  }

  static fromEntities(products: Product[]): ProductDto[] {
    return products.map((product) => ProductDto.fromEntity(product));
  }
}

export class GetHomepageDataResponseDto {
  public readonly categories: CategoryDto[];
  public readonly featuredProducts: ProductDto[];

  constructor(categories: Category[], featuredProducts: Product[]) {
    this.categories = CategoryDto.fromEntities(categories);
    this.featuredProducts = ProductDto.fromEntities(featuredProducts);
  }

  static toDto(
    categories: Category[],
    featuredProducts: Product[]
  ): GetHomepageDataResponseDto {
    return new GetHomepageDataResponseDto(categories, featuredProducts);
  }
}
