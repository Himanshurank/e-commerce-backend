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
      loggerService.error("User Registration Failed", error);
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
      loggerService.error("User Login Failed", error);
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
}
