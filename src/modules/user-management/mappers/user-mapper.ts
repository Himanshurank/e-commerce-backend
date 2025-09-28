import {
  UserEntity,
  UserEntityProps,
  UserRole,
  UserStatus,
} from "../domain/entities/user-entity";
import { v4 as uuidv4 } from "uuid";

export interface UserPersistenceData {
  id: string;
  email: string;
  password: string; // Database uses 'password' not 'password_hash'
  name: string; // Database uses single 'name' field
  role: string;
  status: string;
  email_verified: boolean;
  phone?: string | undefined; // Database uses 'phone' not 'phone_number'
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface UserResponseDto {
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
  updatedAt: string;
}

export interface UserCreateRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string | undefined;
  phoneNumber?: string | undefined;
}

export interface UserUpdateRequestDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | undefined;
}

export interface UserLoginRequestDto {
  email: string;
  password: string;
}

export class UserMapper {
  static toDomain(data: UserPersistenceData): UserEntity {
    // Split name into firstName and lastName
    const nameParts = data.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const props: UserEntityProps = {
      id: data.id,
      email: data.email,
      passwordHash: data.password, // Map password to passwordHash
      firstName: firstName,
      lastName: lastName,
      role: UserMapper.mapDbRoleToDomain(data.role),
      status: UserMapper.mapDbStatusToDomain(data.status),
      emailVerified: data.email_verified,
      phoneNumber: data.phone,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return UserEntity.create(props);
  }

  static toPersistence(user: UserEntity): UserPersistenceData {
    const props = user.getProps();

    return {
      id: props.id || uuidv4(),
      email: props.email,
      password: props.passwordHash, // Map passwordHash to password
      name: `${props.firstName} ${props.lastName}`.trim(), // Combine firstName and lastName
      role: UserMapper.mapDomainRoleToDb(props.role),
      status: UserMapper.mapDomainStatusToDb(props.status),
      email_verified: props.emailVerified,
      phone: props.phoneNumber,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
  }

  static toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.getId(),
      email: user.getEmail(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      fullName: user.getFullName(),
      role: user.getRole(),
      status: user.getStatus(),
      emailVerified: user.isEmailVerified(),
      phoneNumber: user.getPhoneNumber(),
      createdAt: user.getCreatedAt().toISOString(),
      updatedAt: user.getUpdatedAt().toISOString(),
    };
  }

  static toResponseDtoList(users: UserEntity[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }

  static fromCreateRequest(data: UserCreateRequestDto): {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string | undefined;
  } {
    return {
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: (data.role as UserRole) || UserRole.CUSTOMER,
      phoneNumber: data.phoneNumber?.trim(),
    };
  }

  static fromUpdateRequest(data: UserUpdateRequestDto): {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  } {
    const updateData: any = {};

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName.trim();
    }

    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName.trim();
    }

    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber?.trim();
    }

    return updateData;
  }

  static fromLoginRequest(data: UserLoginRequestDto): {
    email: string;
    password: string;
  } {
    return {
      email: data.email.toLowerCase().trim(),
      password: data.password,
    };
  }

  // Helper method for creating user entities from request data
  static createUserEntity(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string | undefined;
  }): UserEntity {
    return UserEntity.createNew({
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phoneNumber: data.phoneNumber,
    });
  }

  // Authentication response mapping
  static toAuthResponseDto(
    user: UserEntity,
    token: string
  ): {
    user: UserResponseDto;
    token: string;
    expiresIn: number;
  } {
    return {
      user: this.toResponseDto(user),
      token,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  // Profile response for different user types
  static toProfileResponseDto(user: UserEntity): UserResponseDto & {
    canLogin: boolean;
    canSellProducts: boolean;
    canAccessAdminPanel: boolean;
    needsApproval: boolean;
  } {
    const baseResponse = this.toResponseDto(user);

    return {
      ...baseResponse,
      canLogin: user.canLogin(),
      canSellProducts: user.canSellProducts(),
      canAccessAdminPanel: user.canAccessAdminPanel(),
      needsApproval: user.needsApproval(),
    };
  }

  // Search results mapping
  static toSearchResponseDto(
    searchResult: {
      users: UserEntity[];
      total: number;
    },
    page: number,
    limit: number
  ): {
    users: UserResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } {
    return {
      users: this.toResponseDtoList(searchResult.users),
      pagination: {
        page,
        limit,
        total: searchResult.total,
        totalPages: Math.ceil(searchResult.total / limit),
      },
    };
  }

  // Helper methods for enum mapping
  static mapDbRoleToDomain(dbRole: string): UserRole {
    switch (dbRole.toLowerCase()) {
      case "customer":
        return UserRole.CUSTOMER;
      case "seller":
        return UserRole.SELLER;
      case "admin":
        return UserRole.ADMIN;
      default:
        return UserRole.CUSTOMER;
    }
  }

  static mapDomainRoleToDb(domainRole: UserRole): string {
    switch (domainRole) {
      case UserRole.CUSTOMER:
        return "customer";
      case UserRole.SELLER:
        return "seller";
      case UserRole.ADMIN:
        return "admin";
      default:
        return "customer";
    }
  }

  static mapDbStatusToDomain(dbStatus: string): UserStatus {
    switch (dbStatus.toLowerCase()) {
      case "pending":
        return UserStatus.PENDING_APPROVAL;
      case "approved":
        return UserStatus.ACTIVE;
      case "rejected":
        return UserStatus.INACTIVE;
      case "suspended":
        return UserStatus.SUSPENDED;
      default:
        return UserStatus.ACTIVE;
    }
  }

  static mapDomainStatusToDb(domainStatus: UserStatus): string {
    switch (domainStatus) {
      case UserStatus.PENDING_APPROVAL:
        return "pending";
      case UserStatus.ACTIVE:
        return "approved";
      case UserStatus.INACTIVE:
        return "rejected";
      case UserStatus.SUSPENDED:
        return "suspended";
      default:
        return "approved";
    }
  }
}
