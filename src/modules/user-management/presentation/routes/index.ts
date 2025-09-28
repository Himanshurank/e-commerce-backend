import { Router } from "express";
import { userRoutes } from "./user-routes";
// Future imports for seller profile routes, admin routes, etc.

const router = Router();

// Mount user management routes directly (no /users prefix since auth routes are already prefixed)
router.use("/", userRoutes);

// Future route groups
// router.use('/seller-profiles', sellerProfileRoutes);
// router.use('/admin', adminRoutes);

export { router as userManagementRoutes };
