import { TUserRecord } from "../../types/infrastructure/repositories/userRepository";
import { UserRole } from "../../enum/userRole";
import { UserStatus } from "../../enum/userStatus";

interface Props {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  loginCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _password: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _phone: string | null;
  private readonly _dateOfBirth: Date | null;
  private readonly _gender: string | null;
  private readonly _role: UserRole;
  private readonly _status: UserStatus;
  private readonly _emailVerified: boolean;
  private readonly _emailVerifiedAt: Date | null;
  private readonly _avatarUrl: string | null;
  private readonly _lastLoginAt: Date | null;
  private readonly _loginCount: number;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;

  constructor({
    id,
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    role,
    status,
    emailVerified,
    emailVerifiedAt,
    avatarUrl,
    lastLoginAt,
    loginCount,
    isActive,
    createdAt,
    updatedAt,
    deletedAt,
  }: Props) {
    this._id = id;
    this._email = email;
    this._password = password;
    this._firstName = firstName;
    this._lastName = lastName;
    this._phone = phone;
    this._dateOfBirth = dateOfBirth;
    this._gender = gender;
    this._role = role;
    this._status = status;
    this._emailVerified = emailVerified;
    this._emailVerifiedAt = emailVerifiedAt;
    this._avatarUrl = avatarUrl;
    this._lastLoginAt = lastLoginAt;
    this._loginCount = loginCount;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;

    this.validate();
  }

  // Static factory for database records
  static create(params: TUserRecord): User {
    return new User({
      id: params.id,
      email: params.email,
      password: params.password_hash,
      firstName: params.first_name,
      lastName: params.last_name,
      phone: params.phone,
      dateOfBirth: params.date_of_birth,
      gender: params.gender,
      role: params.role,
      status: params.status,
      emailVerified: params.email_verified,
      emailVerifiedAt: params.email_verified_at,
      avatarUrl: params.avatar_url,
      lastLoginAt: params.last_login_at,
      loginCount: params.login_count,
      isActive: params.is_active,
      createdAt: params.created_at,
      updatedAt: params.updated_at,
      deletedAt: params.deleted_at,
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get email(): string {
    return this._email;
  }
  get password(): string {
    return this._password;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get phone(): string | null {
    return this._phone;
  }
  get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }
  get gender(): string | null {
    return this._gender;
  }
  get role(): UserRole {
    return this._role;
  }
  get status(): UserStatus {
    return this._status;
  }
  get emailVerified(): boolean {
    return this._emailVerified;
  }
  get emailVerifiedAt(): Date | null {
    return this._emailVerifiedAt;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
  get loginCount(): number {
    return this._loginCount;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // Business methods
  public getFullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public isCustomer(): boolean {
    return this._role === UserRole.CUSTOMER;
  }

  public isSeller(): boolean {
    return this._role === UserRole.SELLER;
  }

  public isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  public isApproved(): boolean {
    return this._status === UserStatus.APPROVED;
  }

  public canLogin(): boolean {
    return (
      this._isActive && !this._deletedAt && this._status === UserStatus.APPROVED
    );
  }

  public canListProducts(): boolean {
    return this.isSeller() && this.isApproved() && this._isActive;
  }

  // Get safe user data (without password)
  public toSafeObject() {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone,
      role: this._role,
      status: this._status,
      emailVerified: this._emailVerified,
      avatarUrl: this._avatarUrl,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private validate(): void {
    if (!this._id || this._id.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!this._email || this._email.trim() === "") {
      throw new Error("User email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new Error("Invalid email format");
    }

    if (!this._password || this._password.trim() === "") {
      throw new Error("User password is required");
    }

    if (!this._firstName || this._firstName.trim() === "") {
      throw new Error("User first name is required");
    }

    if (!this._lastName || this._lastName.trim() === "") {
      throw new Error("User last name is required");
    }

    if (this._loginCount < 0) {
      throw new Error("Login count must be non-negative");
    }
  }
}
