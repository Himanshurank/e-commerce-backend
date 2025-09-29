/**
 * Page Data Controller
 * Handles HTTP requests for page-specific data
 */

import { Request, Response } from "express";
import { GetHomepageDataFactory } from "../../application/use-cases/get-homepage-data/get-homepage-data-factory";
import { GetHomepageDataRequestDto } from "../../application/use-cases/get-homepage-data/get-homepage-data-request-dto";
import { LoggerFactory } from "../../../../shared/factories/logger-factory";

export class PageDataController {
  /**
   * Get homepage data
   * GET /api/v1/pages/homepage
   */
  public async getHomepageData(req: Request, res: Response): Promise<void> {
    const logger = LoggerFactory.getInstance();

    try {
      logger.logApiOperation("started", "GET", "/api/v1/pages/homepage");

      // Extract query parameters
      const categoryLimit = req.query["category_limit"]
        ? parseInt(req.query["category_limit"] as string)
        : undefined;
      const featuredProductLimit = req.query["featured_product_limit"]
        ? parseInt(req.query["featured_product_limit"] as string)
        : undefined;
      const includeMetadata = req.query["include_metadata"] !== "false"; // Default to true

      logger.info("Homepage data request parameters", {
        categoryLimit,
        featuredProductLimit,
        includeMetadata,
      });

      // Create request DTO
      const requestDto = new GetHomepageDataRequestDto({
        categoryLimit,
        featuredProductLimit,
        includeMetadata,
      });

      // Create use case and execute
      const getHomepageDataUseCase = GetHomepageDataFactory.create();
      const result = await getHomepageDataUseCase.execute(requestDto);

      logger.logBusinessEvent("homepage_data_loaded", {
        categoriesCount: result.categories.length,
        productsCount: result.products.featured.length,
        hasMetadata: !!result.metadata,
      });

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          categories: result.categories,
          products: result.products,
          metadata: result.metadata,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error("Homepage data retrieval failed", error as Error);

      res.status(500).json({
        success: false,
        error: {
          code: "HOMEPAGE_DATA_ERROR",
          message: "Failed to retrieve homepage data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}
