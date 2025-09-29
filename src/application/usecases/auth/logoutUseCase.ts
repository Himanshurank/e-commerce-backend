import { ILogoutUseCase } from "../../../domain/interfaces/application/usecases/logoutUseCase";
import { LogoutRequestDto } from "../../Dto/auth/logoutRequest";
import { LogoutResponseDto } from "../../Dto/auth/logoutResponse";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";

export class LogoutUseCase implements ILogoutUseCase {
  constructor(private readonly logger: ILoggerService) {}

  async execute(params: LogoutRequestDto): Promise<LogoutResponseDto> {
    try {
      this.logger.info("User logout initiated", {
        userId: params.userId,
      });

      // For basic logout, we just log the action
      // In future with JWT tokens, we would:
      // 1. Invalidate the token (add to blacklist)
      // 2. Clear session data
      // 3. Update last logout timestamp in database

      this.logger.info("User logout completed successfully", {
        userId: params.userId,
      });

      return LogoutResponseDto.success();
    } catch (error: any) {
      this.logger.error("User logout failed", {
        userId: params.userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
