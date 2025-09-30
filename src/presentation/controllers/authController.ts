import { Request, Response } from "express";
import { IAuthController } from "../../domain/interfaces/authController.interface";
import { SignupUseCase } from "../../application/usecases/auth/signupUseCase";
import { SigninUseCase } from "../../application/usecases/auth/signinUseCase";
import { LogoutUseCase } from "../../application/usecases/auth/logoutUseCase";
import { SignupRequestDto } from "../../application/Dto/auth/signupRequest";
import { SignupResponseDto } from "../../application/Dto/auth/signupResponse";
import { SigninRequestDto } from "../../application/Dto/auth/signinRequest";
import { SigninResponseDto } from "../../application/Dto/auth/signinResponse";
import { LogoutRequestDto } from "../../application/Dto/auth/logoutRequest";
import { LogoutResponseDto } from "../../application/Dto/auth/logoutResponse";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { HTTP_STATUS_CODES } from "../../shared/constants/httpStatusCodes";
import { API_MESSAGES } from "../../shared/constants/apiMessages";
import { ApiResponse, ApiError } from "../../shared/utils/apiResponse";

export class AuthController implements IAuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly signinUseCase: SigninUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logger: ILoggerService
  ) {}

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Signup API called", {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      const signupRequest = SignupRequestDto.fromRequest(req.body);
      const user = await this.signupUseCase.execute(signupRequest);
      const response = SignupResponseDto.fromEntity(user);

      this.logger.info("Signup API completed successfully");

      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.CREATED,
            response,
            "User created successfully"
          )
        );
    } catch (error: any) {
      this.logger.error("Signup API failed", {
        method: req.method,
        path: req.path,
        error: error.message,
        stack: error.stack,
      });

      const statusCode = this.getErrorStatusCode(error);

      res
        .status(statusCode)
        .json(
          new ApiError(
            statusCode,
            error.message || API_MESSAGES.INTERNAL_ERROR,
            []
          )
        );
    }
  }

  private getErrorStatusCode(error: any): number {
    if (error.message.includes("already exists"))
      return HTTP_STATUS_CODES.CONFLICT;
    if (
      error.message.includes("validation") ||
      error.message.includes("required") ||
      error.message.includes("Invalid") ||
      error.message.includes("must be")
    ) {
      return HTTP_STATUS_CODES.BAD_REQUEST;
    }
    return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  }

  public async signin(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Signin API called", {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      const signinRequest = SigninRequestDto.fromRequest(req.body);
      const { user, token } = await this.signinUseCase.execute(signinRequest);
      const response = SigninResponseDto.fromEntity(user, token);

      this.logger.info("Signin API completed successfully", {
        userId: user.id,
        email: user.email,
      });

      res
        .status(HTTP_STATUS_CODES.OK)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.OK,
            response,
            "User signed in successfully"
          )
        );
    } catch (error: any) {
      this.logger.error("Signin API failed", {
        method: req.method,
        path: req.path,
        error: error.message,
        stack: error.stack,
      });

      const statusCode = this.getErrorStatusCode(error);

      res
        .status(statusCode)
        .json(
          new ApiError(
            statusCode,
            error.message || API_MESSAGES.INTERNAL_ERROR,
            []
          )
        );
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Logout API called", {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      const logoutRequest = LogoutRequestDto.fromRequest(req.body);
      const response = await this.logoutUseCase.execute(logoutRequest);

      this.logger.info("Logout API completed successfully");

      res
        .status(HTTP_STATUS_CODES.OK)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.OK,
            response,
            "User logged out successfully"
          )
        );
    } catch (error: any) {
      this.logger.error("Logout API failed", {
        method: req.method,
        path: req.path,
        error: error.message,
        stack: error.stack,
      });

      const statusCode = this.getErrorStatusCode(error);

      res
        .status(statusCode)
        .json(
          new ApiError(
            statusCode,
            error.message || API_MESSAGES.INTERNAL_ERROR,
            []
          )
        );
    }
  }
}
