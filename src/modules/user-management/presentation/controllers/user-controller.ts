import { Request, Response, NextFunction } from "express";
import { RegisterUserFactory } from "../../application/use-cases/register-user/register-user-factory";
import { LoginUserFactory } from "../../application/use-cases/login-user/login-user-factory";
import { RegisterUserRequestDto } from "../../application/use-cases/register-user/register-user-request-dto";
import { LoginUserRequestDto } from "../../application/use-cases/login-user/login-user-request-dto";

export class UserController {
  static async registerUser(
    req: Request<{}, {}, RegisterUserRequestDto>,
    res: Response,
    next: NextFunction
  ) {
    const { useCase, loggerService } = await RegisterUserFactory.create(req);

    try {
      const requestData: RegisterUserRequestDto = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        phoneNumber: req.body.phoneNumber,
      };

      const response = await useCase.execute(requestData);

      res.status(201).json({
        success: true,
        data: response,
        message: "User registered successfully",
      });
    } catch (error: any) {
      loggerService.errorLog({
        data: error,
        msg: "User Registration Failed",
        userId: null,
        requestBody: req.body,
      });
      return next(error);
    }
  }

  static async loginUser(
    req: Request<{}, {}, LoginUserRequestDto>,
    res: Response,
    next: NextFunction
  ) {
    const { useCase, loggerService } = await LoginUserFactory.create(req);

    try {
      const requestData: LoginUserRequestDto = {
        email: req.body.email,
        password: req.body.password,
        rememberMe: req.body.rememberMe,
      };

      const response = await useCase.execute(requestData);

      // Set refresh token in HTTP-only cookie if provided
      if (response.refreshToken) {
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true,
          secure: process.env["NODE_ENV"] === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      res.status(200).json({
        success: true,
        data: {
          ...response,
          refreshToken: undefined, // Don't send refresh token in response body
        },
        message: "Login successful",
      });
    } catch (error: any) {
      loggerService.errorLog({
        data: error,
        msg: "User Login Failed",
        email: req.body.email,
      });
      return next(error);
    }
  }

  static async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error: any) {
      return next(error);
    }
  }

  static async getUserProfile(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      // This would be populated by authentication middleware
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // TODO: Implement get user profile use case
      res.status(200).json({
        success: true,
        data: {
          message: "Get user profile endpoint - to be implemented",
          userId,
        },
      });
    } catch (error: any) {
      return next(error);
    }
  }

  static async updateUserProfile(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      // This would be populated by authentication middleware
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // TODO: Implement update user profile use case
      res.status(200).json({
        success: true,
        data: {
          message: "Update user profile endpoint - to be implemented",
          userId,
          requestBody: req.body,
        },
      });
    } catch (error: any) {
      return next(error);
    }
  }

  static async verifyEmail(
    req: Request<{ token: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token } = req.params;

      // TODO: Implement email verification use case
      res.status(200).json({
        success: true,
        data: {
          message: "Email verification endpoint - to be implemented",
          token,
        },
      });
    } catch (error: any) {
      return next(error);
    }
  }

  static async resendEmailVerification(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // TODO: Implement resend email verification use case
      res.status(200).json({
        success: true,
        data: {
          message: "Resend email verification endpoint - to be implemented",
          userId,
        },
      });
    } catch (error: any) {
      return next(error);
    }
  }

  static async requestPasswordReset(
    req: Request<{}, {}, { email: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = req.body;

      // TODO: Implement password reset request use case
      res.status(200).json({
        success: true,
        data: {
          message: "Password reset request endpoint - to be implemented",
          email,
        },
      });
    } catch (error: any) {
      return next(error);
    }
  }

  static async resetPassword(
    req: Request<{ token: string }, {}, { password: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // TODO: Implement password reset use case
      res.status(200).json({
        success: true,
        data: {
          message: "Password reset endpoint - to be implemented",
          token,
        },
      });
    } catch (error: any) {
      return next(error);
    }
  }
}
