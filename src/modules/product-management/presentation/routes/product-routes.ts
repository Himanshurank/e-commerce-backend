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

// Get products with filtering and pagination
router.get("/", productController.getProducts.bind(productController));

/**
 * Protected Routes (Require Authentication)
 */

// Create product (Sellers and Admins only)
router.post(
  "/",
  authenticateToken,
  requireRole(["seller", "admin"]),
  validateRequest(createProductValidation as any),
  productController.createProduct.bind(productController)
);

// Update product (Sellers - own products, Admins - any product)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["seller", "admin"]),
  productController.updateProduct.bind(productController)
);

// Delete product (Sellers - own products, Admins - any product)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["seller", "admin"]),
  productController.deleteProduct.bind(productController)
);

/**
 * Seller Routes
 */

// Get seller's products
router.get(
  "/seller/my-products",
  authenticateToken,
  requireRole(["seller", "admin"]),
  productController.getSellerProducts.bind(productController)
);

export default router;
