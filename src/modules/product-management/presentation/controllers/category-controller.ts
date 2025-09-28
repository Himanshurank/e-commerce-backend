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
      if (req.user?.role !== "ADMIN") {
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

  // Removed unimplemented methods:
  // - getCategory, getCategories, getCategoryTree, updateCategory, deleteCategory
  // TODO: Add back when implementing category management features
}
