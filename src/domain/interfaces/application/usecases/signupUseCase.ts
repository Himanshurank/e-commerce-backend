import { User } from "../../../entities/auth/user";
import { SignupRequestDto } from "../../../../application/Dto/auth/signupRequest";

export interface ISignupUseCase {
  execute(params: SignupRequestDto): Promise<User>;
}

