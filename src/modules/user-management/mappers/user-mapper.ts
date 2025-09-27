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
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  phone_number?: string | undefined;
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
    const props: UserEntityProps = {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      emailVerified: data.email_verified,
      phoneNumber: data.phone_number,
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
      password_hash: props.passwordHash,
      first_name: props.firstName,
      last_name: props.lastName,
      role: props.role,
      status: props.status,
      email_verified: props.emailVerified,
      phone_number: props.phoneNumber,
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
}
