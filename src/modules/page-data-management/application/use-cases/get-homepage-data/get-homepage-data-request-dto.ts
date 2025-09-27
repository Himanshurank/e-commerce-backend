/**
 * Get Homepage Data Request DTO
 */

export interface IGetHomepageDataRequestDto {
  categoryLimit?: number | undefined;
  featuredProductLimit?: number | undefined;
  includeMetadata?: boolean | undefined;
}

export class GetHomepageDataRequestDto implements IGetHomepageDataRequestDto {
  public readonly categoryLimit?: number | undefined;
  public readonly featuredProductLimit?: number | undefined;
  public readonly includeMetadata?: boolean | undefined;

  constructor(data: IGetHomepageDataRequestDto = {}) {
    this.categoryLimit = data.categoryLimit || 8;
    this.featuredProductLimit = data.featuredProductLimit || 8;
    this.includeMetadata = data.includeMetadata !== false; // Default to true
  }

  /**
   * Validate request parameters
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.categoryLimit !== undefined) {
      if (this.categoryLimit < 1 || this.categoryLimit > 20) {
        errors.push("categoryLimit must be between 1 and 20");
      }
    }

    if (this.featuredProductLimit !== undefined) {
      if (this.featuredProductLimit < 1 || this.featuredProductLimit > 50) {
        errors.push("featuredProductLimit must be between 1 and 50");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
