export interface RegisterUserResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    status: string;
    emailVerified: boolean;
    phoneNumber?: string | undefined;
    createdAt: string;
  };
  token: string;
  expiresIn: number;
  emailVerificationRequired: boolean;
  message: string;
}
