export interface LoginUserResponseDto {
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
    canLogin: boolean;
    canSellProducts: boolean;
    canAccessAdminPanel: boolean;
    needsApproval: boolean;
  };
  token: string;
  refreshToken?: string | undefined;
  expiresIn: number;
  sellerProfile?:
    | {
        id: string;
        businessName: string;
        isVerified: boolean;
        canReceivePayouts: boolean;
        hasCompleteProfile: boolean;
      }
    | undefined;
  message: string;
}
