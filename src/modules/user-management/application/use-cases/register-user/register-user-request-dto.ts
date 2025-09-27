export interface RegisterUserRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "CUSTOMER" | "SELLER" | undefined;
  phoneNumber?: string | undefined;
}

export interface RegisterUserValidation {
  isValid: boolean;
  errors: string[];
}
