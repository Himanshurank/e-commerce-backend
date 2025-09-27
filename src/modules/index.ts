import { Router } from "express";
import { userManagementRoutes } from "./user-management/presentation/routes";
import productManagementRoutes from "./product-management/presentation/routes";
import pageDataManagementRoutes from "./page-data-management/presentation/routes";

const router = Router();

// Mount user management module routes
router.use("/api/v1/auth", userManagementRoutes);

// Mount product management module routes
router.use("/api/v1", productManagementRoutes);

// Mount page data management module routes
router.use("/api/v1", pageDataManagementRoutes);

// Future module routes will be added here
// router.use('/api/v1/orders', orderManagementRoutes);
// router.use('/api/v1/payments', paymentManagementRoutes);

export { router as moduleRoutes };
