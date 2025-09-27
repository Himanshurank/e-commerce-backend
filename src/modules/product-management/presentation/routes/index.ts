/**
 * Product Management Routes Index
 * Main router for product management module
 */

import { Router } from "express";
import productRoutes from "./product-routes";
import categoryRoutes from "./category-routes";

const router = Router();

// Mount product routes
router.use("/products", productRoutes);

// Mount category routes
router.use("/categories", categoryRoutes);

export default router;
