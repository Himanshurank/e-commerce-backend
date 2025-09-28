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
 * Admin Only Routes
 */

// Create category (Admin only)
router.post(
  "/",
  authenticateToken,
  requireRole(["ADMIN"]),
  validateRequest(createCategoryValidation as any),
  categoryController.createCategory.bind(categoryController)
);

// TODO: Add back other routes when implementing full category management

export default router;
