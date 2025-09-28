import { Router } from "express";
import Joi from "joi";
import { UserController } from "../controllers/user-controller";
import { userValidationSchemas } from "../validation/user-validation";
import { validateRequest } from "../../../../shared/middleware/validation-middleware";
import { authenticateToken } from "../../../../shared/middleware/auth-middleware";

const router = Router();

// Public routes (no authentication required)
router.post(
  "/register",
  validateRequest({ body: userValidationSchemas.registerUser }),
  UserController.registerUser
);

router.post(
  "/login",
  validateRequest({ body: userValidationSchemas.loginUser }),
  UserController.loginUser
);

router.post("/logout", UserController.logoutUser);

// Protected routes (authentication required)
// TODO: Implement profile management endpoints when needed

export { router as userRoutes };
