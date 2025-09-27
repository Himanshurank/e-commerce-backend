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

router.get(
  "/verify-email/:token",
  validateRequest({ params: userValidationSchemas.emailVerificationToken }),
  UserController.verifyEmail
);

router.post(
  "/request-password-reset",
  validateRequest({ body: userValidationSchemas.requestPasswordReset }),
  UserController.requestPasswordReset
);

router.post(
  "/reset-password/:token",
  validateRequest({
    params: Joi.object({ token: Joi.string().required() }),
    body: userValidationSchemas.resetPassword,
  }),
  UserController.resetPassword
);

// Protected routes (authentication required)
router.get("/profile", authenticateToken, UserController.getUserProfile);

router.put(
  "/profile",
  authenticateToken,
  validateRequest({ body: userValidationSchemas.updateUserProfile }),
  UserController.updateUserProfile
);

router.post(
  "/resend-verification",
  authenticateToken,
  UserController.resendEmailVerification
);

export { router as userRoutes };
