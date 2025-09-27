export interface UserEntityProps {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneNumber?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
}

export class UserEntity {
  private props!: UserEntityProps;

  static create(props: UserEntityProps): UserEntity {
    const userEntity = new UserEntity();
    userEntity.props = props;
    return userEntity;
  }

  static createNew(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string | undefined;
  }): UserEntity {
    return UserEntity.create({
      id: "", // Will be set by repository
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status:
        data.role === UserRole.SELLER
          ? UserStatus.PENDING_APPROVAL
          : UserStatus.ACTIVE,
      emailVerified: false,
      phoneNumber: data.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters
  getId(): string {
    return this.props.id;
  }

  getEmail(): string {
    return this.props.email;
  }

  getPasswordHash(): string {
    return this.props.passwordHash;
  }

  getFirstName(): string {
    return this.props.firstName;
  }

  getLastName(): string {
    return this.props.lastName;
  }

  getFullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  getRole(): UserRole {
    return this.props.role;
  }

  getStatus(): UserStatus {
    return this.props.status;
  }

  isEmailVerified(): boolean {
    return this.props.emailVerified;
  }

  getPhoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getProps(): UserEntityProps {
    return { ...this.props };
  }

  // Business Logic Methods
  isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  isSeller(): boolean {
    return this.props.role === UserRole.SELLER;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isCustomer(): boolean {
    return this.props.role === UserRole.CUSTOMER;
  }

  canLogin(): boolean {
    return this.isActive() && this.isEmailVerified();
  }

  canSellProducts(): boolean {
    return this.isSeller() && this.isActive();
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin() && this.isActive();
  }

  needsApproval(): boolean {
    return this.props.status === UserStatus.PENDING_APPROVAL;
  }

  // State Modification Methods
  verifyEmail(): void {
    this.props.emailVerified = true;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.status = UserStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    this.props.status = UserStatus.SUSPENDED;
    this.props.updatedAt = new Date();
  }

  approve(): void {
    if (this.props.status === UserStatus.PENDING_APPROVAL) {
      this.props.status = UserStatus.ACTIVE;
      this.props.updatedAt = new Date();
    }
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }): void {
    if (data.firstName) this.props.firstName = data.firstName;
    if (data.lastName) this.props.lastName = data.lastName;
    if (data.phoneNumber) this.props.phoneNumber = data.phoneNumber;
    this.props.updatedAt = new Date();
  }

  updatePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
  }
}
