/**
 * Page Data Domain Interfaces
 * Repository contracts for page data operations
 */

import {
  IHomepageDataEntity,
  IHomepageCategoryData,
  IHomepageProductData,
} from "../entities/homepage-data-entity";

export interface IHomepageDataFilters {
  categoryLimit?: number | undefined;
  featuredProductLimit?: number | undefined;
  includeInactiveCategories?: boolean | undefined;
  includePrivateProducts?: boolean | undefined;
}

export interface IHomepageDataService {
  /**
   * Build complete homepage data from multiple sources
   */
  buildHomepageData(
    filters?: IHomepageDataFilters | undefined
  ): Promise<IHomepageDataEntity>;

  /**
   * Generate cache expiry time based on current timestamp
   */
  generateCacheExpiry(): Date;
}
