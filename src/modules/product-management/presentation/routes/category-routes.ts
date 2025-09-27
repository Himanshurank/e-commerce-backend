/**
 * Category Routes
 * Express routes for category management
 */

import { Router } from "express";
import { CategoryController } from "../controllers/category-controller";
import {
  authenticateToken,
  requireRole,
} from "../../../../shared/middleware/auth-middleware";
import { validateRequest } from "../../../../shared/middleware/validation-middleware";
import { createCategoryValidation } from "../validation/category-validation";

const router = Router();
const categoryController = new CategoryController();

/**
 * Public Routes
 */

// Get all categories
router.get("/", categoryController.getCategories.bind(categoryController));

// Get category tree
router.get(
  "/tree",
  categoryController.getCategoryTree.bind(categoryController)
);

// Get category by ID or slug
router.get(
  "/:identifier",
  categoryController.getCategory.bind(categoryController)
);

/**
 * Admin Only Routes
 */

// Create category (Admin only)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin"]),
  validateRequest(createCategoryValidation as any),
  categoryController.createCategory.bind(categoryController)
);

// Update category (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  categoryController.updateCategory.bind(categoryController)
);

// Delete category (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
