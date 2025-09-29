/**
 * Product Controller
 * Handles HTTP requests for product operations
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../../../../shared/middleware/auth-middleware";
import { CreateProductFactory } from "../../application/use-cases/create-product/create-product-factory";
import { GetProductFactory } from "../../application/use-cases/get-product/get-product-factory";
import { CreateProductRequestDto } from "../../application/use-cases/create-product/create-product-request-dto";
import { GetProductRequestDto } from "../../application/use-cases/get-product/get-product-request-dto";
import { LoggerFactory } from "../../../../shared/factories/logger-factory";

export class ProductController {
  /**
   * Create a new product
   * POST /api/v1/products
   */
  async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const logger = LoggerFactory.getInstance();

    try {
      logger.logApiOperation(
        "started",
        "POST",
        "/api/v1/products",
        req.user?.userId ? parseInt(req.user.userId) : undefined
      );

      // Extract seller ID from authenticated user
      const sellerId = req.user?.userId;
      if (!sellerId) {
        logger.warn("Product creation failed - authentication required");
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Check if user is a seller
      if (req.user?.role !== "SELLER" && req.user?.role !== "ADMIN") {
        logger.warn("Product creation failed - insufficient permissions", {
          userId: sellerId,
          role: req.user?.role,
        });
        res.status(403).json({
          success: false,
          message: "Only sellers can create products",
        });
        return;
      }

      // Create request DTO
      const requestDto = new CreateProductRequestDto({
        ...req.body,
        sellerId,
      });

      // Execute use case
      const useCase = CreateProductFactory.create();
      const result = await useCase.execute(requestDto);

      logger.logBusinessEvent("product_created", {
        productId: result.id,
        sellerId: sellerId,
        productName: result.name,
      });

      // Return response
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: result,
      });
    } catch (error: any) {
      logger.error("Product creation failed", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create product",
      });
    }
  }

  /**
   * Get product by ID or slug
   * GET /api/v1/products/:identifier
   */
  async getProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const logger = LoggerFactory.getInstance();

    try {
      const { identifier } = req.params;
      const incrementViewCount = req.query["increment_view"] === "true";

      logger.logApiOperation(
        "started",
        "GET",
        `/api/v1/products/${identifier}`,
        req.user?.userId ? parseInt(req.user.userId) : undefined,
        {
          identifier,
          incrementViewCount,
        }
      );

      // Determine if identifier is UUID (ID) or slug
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          identifier || ""
        );

      // Create request DTO
      const requestDto = new GetProductRequestDto({
        productId: isUUID ? identifier : undefined,
        slug: !isUUID ? identifier : undefined,
        incrementViewCount,
      });

      // Execute use case
      const useCase = GetProductFactory.create();
      const result = await useCase.execute(requestDto);

      if (incrementViewCount) {
        logger.logBusinessEvent("product_viewed", {
          productId: result.id,
          userId: req.user?.userId,
          viewCount: result.viewCount,
        });
      }

      // Return response
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Product not found") {
        logger.warn("Product not found", {
          identifier: req.params["identifier"],
        });
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      logger.error("Get product failed", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get product",
      });
    }
  }

  // Removed unimplemented methods:
  // - getProducts, updateProduct, deleteProduct, getSellerProducts
  // TODO: Add back when implementing product management features
}
