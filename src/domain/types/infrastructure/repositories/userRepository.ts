import { UserRole } from "../../../enum/userRole";
import { UserStatus } from "../../../enum/userStatus";

export type TUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: Date | null;
  gender: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  email_verified_at: Date | null;
  avatar_url: string | null;
  last_login_at: Date | null;
  login_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type TCreateUserParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | undefined;
  role: UserRole | undefined;
};
