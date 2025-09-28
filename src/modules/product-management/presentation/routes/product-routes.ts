/**
 * Product Routes
 * Express routes for product management
 */

import { Router } from "express";
import { ProductController } from "../controllers/product-controller";
import {
  authenticateToken,
  requireRole,
} from "../../../../shared/middleware/auth-middleware";
import { validateRequest } from "../../../../shared/middleware/validation-middleware";
import {
  createProductValidation,
  getProductValidation,
} from "../validation/product-validation";

const router = Router();
const productController = new ProductController();

/**
 * Public Routes
 */

// Get product by ID or slug
router.get(
  "/:identifier",
  validateRequest(getProductValidation as any),
  productController.getProduct.bind(productController)
);

/**
 * Protected Routes (Require Authentication)
 */

// Create product (Sellers and Admins only)
router.post(
  "/",
  authenticateToken,
  requireRole(["SELLER", "ADMIN"]),
  validateRequest(createProductValidation as any),
  productController.createProduct.bind(productController)
);

// TODO: Add back other routes when implementing full product management

export default router;
