import { Router } from "express";
import { userManagementRoutes } from "./user-management/presentation/routes";
import productManagementRoutes from "./product-management/presentation/routes";

const router = Router();

// Mount user management module routes
router.use("/api/v1/auth", userManagementRoutes);

// Mount product management module routes
router.use("/api/v1", productManagementRoutes);

// Future module routes will be added here
// router.use('/api/v1/orders', orderManagementRoutes);
// router.use('/api/v1/payments', paymentManagementRoutes);

export { router as moduleRoutes };
