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

export class ProductController {
  /**
   * Create a new product
   * POST /api/v1/products
   */
  async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract seller ID from authenticated user
      const sellerId = req.user?.userId;
      if (!sellerId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Check if user is a seller
      if (req.user?.role !== "seller" && req.user?.role !== "admin") {
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

      // Return response
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: result,
      });
    } catch (error: any) {
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
    try {
      const { identifier } = req.params;
      const incrementViewCount = req.query["increment_view"] === "true";

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

      // Return response
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Product not found") {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || "Failed to get product",
      });
    }
  }

  /**
   * Get products with filtering and pagination
   * GET /api/v1/products
   */
  async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement get products with filters
      res.status(501).json({
        success: false,
        message: "Get products endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get products",
      });
    }
  }

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement update product
      res.status(501).json({
        success: false,
        message: "Update product endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update product",
      });
    }
  }

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement delete product
      res.status(501).json({
        success: false,
        message: "Delete product endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete product",
      });
    }
  }

  /**
   * Get seller's products
   * GET /api/v1/seller/products
   */
  async getSellerProducts(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // TODO: Implement get seller products
      res.status(501).json({
        success: false,
        message: "Get seller products endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get seller products",
      });
    }
  }
}
