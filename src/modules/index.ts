import { Router } from "express";
import { userManagementRoutes } from "./user-management/presentation/routes";

const router = Router();

// Mount user management module routes
router.use("/api/v1/auth", userManagementRoutes);

// Future module routes will be added here
// router.use('/api/v1/products', productManagementRoutes);
// router.use('/api/v1/orders', orderManagementRoutes);
// router.use('/api/v1/payments', paymentManagementRoutes);

export { router as moduleRoutes };
