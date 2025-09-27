/**
 * Page Data Routes
 * Routes for page-specific data endpoints
 */

import { Router } from "express";
import { PageDataController } from "../controllers/page-data-controller";

const router = Router();
const pageDataController = new PageDataController();

/**
 * Homepage Data Routes
 */

// Get complete homepage data (categories + featured products + metadata)
router.get(
  "/homepage",
  pageDataController.getHomepageData.bind(pageDataController)
);

/**
 * Future page data routes can be added here:
 *
 * // Product listing page data
 * router.get("/product-listing", pageDataController.getProductListingData);
 *
 * // Product detail page data
 * router.get("/product-detail/:id", pageDataController.getProductDetailData);
 *
 * // User dashboard data
 * router.get("/dashboard", authenticateToken, pageDataController.getDashboardData);
 *
 * // Search results page data
 * router.get("/search", pageDataController.getSearchPageData);
 */

export default router;
