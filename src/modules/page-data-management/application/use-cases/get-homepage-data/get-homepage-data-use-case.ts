/**
 * Get Homepage Data Use Case
 * Business logic for retrieving homepage data
 */

import { GetHomepageDataRequestDto } from "./get-homepage-data-request-dto";
import {
  GetHomepageDataResponseDto,
  IGetHomepageDataResponseDto,
} from "./get-homepage-data-response-dto";
import { IHomepageDataService } from "../../../domain/interfaces/page-data-domain-interfaces";

export class GetHomepageDataUseCase {
  constructor(private readonly homepageDataService: IHomepageDataService) {}

  /**
   * Execute the use case
   */
  public async execute(
    request: GetHomepageDataRequestDto
  ): Promise<GetHomepageDataResponseDto> {
    try {
      // Validate request
      const validation = request.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Build homepage data using the domain service
      const homepageData = await this.homepageDataService.buildHomepageData({
        categoryLimit: request.categoryLimit,
        featuredProductLimit: request.featuredProductLimit,
      });

      // Prepare response data
      const responseData: IGetHomepageDataResponseDto = {
        categories: homepageData.categories,
        products: {
          featured: homepageData.products.featured,
        },
        metadata: request.includeMetadata ? homepageData.metadata : undefined,
        message: "Homepage data retrieved successfully",
      };

      return new GetHomepageDataResponseDto(responseData);
    } catch (error) {
      console.error("GetHomepageDataUseCase Error:", error);

      // Return empty but valid response on error
      const errorResponse: IGetHomepageDataResponseDto = {
        categories: [],
        products: {
          featured: [],
        },
        metadata: request.includeMetadata
          ? {
              totalCategories: 0,
              totalProducts: 0,
              lastUpdated: new Date(),
            }
          : undefined,
        message: `Failed to retrieve homepage data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };

      return new GetHomepageDataResponseDto(errorResponse);
    }
  }
}
