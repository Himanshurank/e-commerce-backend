import { User } from "../../../entities/auth/user";
import { SigninRequestDto } from "../../../../application/Dto/auth/signinRequest";

export interface ISigninUseCase {
  execute(params: SigninRequestDto): Promise<{ user: User; token?: string }>;
}
