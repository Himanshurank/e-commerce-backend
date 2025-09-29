import { Request, Response } from "express";
import { IHomepageController } from "../../domain/interfaces/presentation/controllers/homepageController";
import { IGetHomepageDataUseCase } from "../../domain/interfaces/application/usecases/getHomepageDataUseCase";
import { GetHomepageDataResponseDto } from "../../application/Dto/homepage/getHomepageDataResponse";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { HTTP_STATUS_CODES } from "../../shared/constants/httpStatusCodes";
import { API_MESSAGES } from "../../shared/constants/apiMessages";
import { ApiResponse, ApiError } from "../../shared/utils/apiResponse";

export class HomepageController implements IHomepageController {
  constructor(
    private readonly getHomepageDataUseCase: IGetHomepageDataUseCase,
    private readonly logger: ILoggerService
  ) {}

  public async getHomepageData(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Homepage API called", {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      const homepageData = await this.getHomepageDataUseCase.execute();

      const response = GetHomepageDataResponseDto.toDto(
        homepageData.categories,
        homepageData.featuredProducts
      );

      this.logger.info("Homepage API completed successfully");

      res
        .status(HTTP_STATUS_CODES.OK)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.OK,
            response,
            API_MESSAGES.HOMEPAGE_DATA_RETRIEVED
          )
        );
    } catch (error: any) {
      this.logger.error("Homepage API failed", {
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
    if (error.message.includes("not found")) return HTTP_STATUS_CODES.NOT_FOUND;
    if (error.message.includes("validation"))
      return HTTP_STATUS_CODES.BAD_REQUEST;
    return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  }
}
