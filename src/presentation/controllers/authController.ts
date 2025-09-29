import { Request, Response } from "express";
import { IAuthController } from "../../domain/interfaces/presentation/controllers/authController";
import { ISignupUseCase } from "../../domain/interfaces/application/usecases/signupUseCase";
import { SignupRequestDto } from "../../application/Dto/auth/signupRequest";
import { SignupResponseDto } from "../../application/Dto/auth/signupResponse";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { HTTP_STATUS_CODES } from "../../shared/constants/httpStatusCodes";
import { API_MESSAGES } from "../../shared/constants/apiMessages";
import { ApiResponse, ApiError } from "../../shared/utils/apiResponse";

export class AuthController implements IAuthController {
  constructor(
    private readonly signupUseCase: ISignupUseCase,
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
}

