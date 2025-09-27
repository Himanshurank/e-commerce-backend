export interface LoginUserRequestDto {
  email: string;
  password: string;
  rememberMe?: boolean | undefined;
}
