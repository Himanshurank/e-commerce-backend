import { LogoutRequestDto } from "../../../../application/Dto/auth/logoutRequest";
import { LogoutResponseDto } from "../../../../application/Dto/auth/logoutResponse";

export interface ILogoutUseCase {
  execute(params: LogoutRequestDto): Promise<LogoutResponseDto>;
}
