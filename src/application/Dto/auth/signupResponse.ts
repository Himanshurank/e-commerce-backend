import { User } from "../../../domain/entities/auth/user";
import { UserRole } from "../../../domain/enum/userRole";
import { UserStatus } from "../../../domain/enum/userStatus";

export class SignupResponseDto {
  public readonly id: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phone: string | null;
  public readonly role: UserRole;
  public readonly status: UserStatus;
  public readonly emailVerified: boolean;
  public readonly createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.role = user.role;
    this.status = user.status;
    this.emailVerified = user.emailVerified;
    this.createdAt = user.createdAt;
  }

  static fromEntity(user: User): SignupResponseDto {
    return new SignupResponseDto(user);
  }
}

