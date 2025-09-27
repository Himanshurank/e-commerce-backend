/**
 * Category Controller
 * Handles HTTP requests for category operations
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../../../../shared/middleware/auth-middleware";
import { CreateCategoryFactory } from "../../application/use-cases/create-category/create-category-factory";
import { CreateCategoryRequestDto } from "../../application/use-cases/create-category/create-category-request-dto";

export class CategoryController {
  /**
   * Create a new category (Admin only)
   * POST /api/v1/categories
   */
  async createCategory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // Check if user is admin
      if (req.user?.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Only administrators can create categories",
        });
        return;
      }

      // Create request DTO
      const requestDto = new CreateCategoryRequestDto(req.body);

      // Execute use case
      const useCase = CreateCategoryFactory.create();
      const result = await useCase.execute(requestDto);

      // Return response
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create category",
      });
    }
  }

  /**
   * Get category by ID or slug
   * GET /api/v1/categories/:identifier
   */
  async getCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement get category
      res.status(501).json({
        success: false,
        message: "Get category endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get category",
      });
    }
  }

  /**
   * Get all categories with hierarchy
   * GET /api/v1/categories
   */
  async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement get categories
      res.status(501).json({
        success: false,
        message: "Get categories endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get categories",
      });
    }
  }

  /**
   * Get category tree
   * GET /api/v1/categories/tree
   */
  async getCategoryTree(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // TODO: Implement get category tree
      res.status(501).json({
        success: false,
        message: "Get category tree endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get category tree",
      });
    }
  }

  /**
   * Update category (Admin only)
   * PUT /api/v1/categories/:id
   */
  async updateCategory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // TODO: Implement update category
      res.status(501).json({
        success: false,
        message: "Update category endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update category",
      });
    }
  }

  /**
   * Delete category (Admin only)
   * DELETE /api/v1/categories/:id
   */
  async deleteCategory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // TODO: Implement delete category
      res.status(501).json({
        success: false,
        message: "Delete category endpoint not yet implemented",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete category",
      });
    }
  }
}
