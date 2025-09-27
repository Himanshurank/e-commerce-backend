/**
 * Page Data Management Routes Index
 * Main router for page data management module
 */

import { Router } from "express";
import pageDataRoutes from "./page-data-routes";

const router = Router();

// Mount page data routes
router.use("/pages", pageDataRoutes);

export default router;
