import { Request, Response } from "express";
import { ICartController } from "../../domain/interfaces/cartController.interface";
import { AddToCartUseCase } from "../../application/usecases/cart/addToCartUseCase";
import { GetCartUseCase } from "../../application/usecases/cart/getCartUseCase";
import { AddToCartRequestDto } from "../../application/Dto/cart/addToCartRequest";
import { AddToCartResponseDto } from "../../application/Dto/cart/addToCartResponse";
import { GetCartRequestDto } from "../../application/Dto/cart/getCartRequest";
import { GetCartResponseDto } from "../../application/Dto/cart/getCartResponse";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { HTTP_STATUS_CODES } from "../../shared/constants/httpStatusCodes";
import { API_MESSAGES } from "../../shared/constants/apiMessages";
import { ApiResponse, ApiError } from "../../shared/utils/apiResponse";

export class CartController implements ICartController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly logger: ILoggerService
  ) {}

  public async addToCart(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Add to cart API called", {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      // For now, we'll use a mock user ID
      // In a real implementation, you would extract this from JWT token
      const userId = req.body.userId || "mock-user-id";

      const addToCartRequest = AddToCartRequestDto.fromRequest(
        req.body,
        userId
      );
      const response = await this.addToCartUseCase.execute(addToCartRequest);

      this.logger.info("Add to cart API completed successfully", {
        userId,
        productId: addToCartRequest.productId,
        cartItemId: response.cartItemId,
      });

      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.CREATED,
            response,
            "Product added to cart successfully"
          )
        );
    } catch (error: any) {
      this.logger.error("Add to cart API failed", {
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

  public async getCart(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Get cart API called", {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      // For now, we'll use a mock user ID
      // In a real implementation, you would extract this from JWT token
      const userId = req.params.userId || req.query.userId || "mock-user-id";

      const getCartRequest = GetCartRequestDto.fromRequest(userId as string);
      const response = await this.getCartUseCase.execute(getCartRequest);

      this.logger.info("Get cart API completed successfully", {
        userId,
        itemCount: response.items.length,
        totalAmount: response.totalAmount,
      });

      res
        .status(HTTP_STATUS_CODES.OK)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.OK,
            response,
            "Cart retrieved successfully"
          )
        );
    } catch (error: any) {
      this.logger.error("Get cart API failed", {
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
    if (
      error.message.includes("required") ||
      error.message.includes("Invalid") ||
      error.message.includes("must be")
    ) {
      return HTTP_STATUS_CODES.BAD_REQUEST;
    }
    return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  }
}
