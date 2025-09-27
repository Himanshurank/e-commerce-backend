/**
 * Get Homepage Data Response DTO
 */

import {
  IHomepageCategoryData,
  IHomepageProductData,
  IHomepageMetadata,
} from "../../../domain/entities/homepage-data-entity";

export interface IGetHomepageDataResponseDto {
  categories: IHomepageCategoryData[];
  products: {
    featured: IHomepageProductData[];
  };
  metadata?: IHomepageMetadata | undefined;
  message: string;
}

export class GetHomepageDataResponseDto implements IGetHomepageDataResponseDto {
  public readonly categories: IHomepageCategoryData[];
  public readonly products: {
    featured: IHomepageProductData[];
  };
  public readonly metadata?: IHomepageMetadata | undefined;
  public readonly message: string;

  constructor(data: IGetHomepageDataResponseDto) {
    this.categories = data.categories;
    this.products = data.products;
    this.metadata = data.metadata;
    this.message = data.message || "Homepage data retrieved successfully";
  }
}
