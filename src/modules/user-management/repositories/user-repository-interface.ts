import { UserEntity } from "../domain/entities/user-entity";
import { SellerProfileEntity } from "../domain/entities/seller-profile-entity";

export interface UserRepositoryInterface {
  // User CRUD Operations
  createUser(user: UserEntity): Promise<UserEntity>;
  getUserById(id: string): Promise<UserEntity | null>;
  getUserByEmail(email: string): Promise<UserEntity | null>;
  updateUser(id: string, user: UserEntity): Promise<UserEntity>;
  deleteUser(id: string): Promise<void>;

  // User Search and Filtering
  getUsersByRole(role: string): Promise<UserEntity[]>;
  getUsersByStatus(status: string): Promise<UserEntity[]>;
  searchUsers(searchParams: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: UserEntity[]; total: number }>;

  // Authentication related
  verifyUserEmail(userId: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;

  // Seller Profile Operations
  createSellerProfile(
    sellerProfile: SellerProfileEntity
  ): Promise<SellerProfileEntity>;
  getSellerProfileByUserId(userId: string): Promise<SellerProfileEntity | null>;
  getSellerProfileById(id: string): Promise<SellerProfileEntity | null>;
  updateSellerProfile(
    id: string,
    sellerProfile: SellerProfileEntity
  ): Promise<SellerProfileEntity>;
  deleteSellerProfile(id: string): Promise<void>;

  // Seller specific queries
  getPendingSellerProfiles(): Promise<SellerProfileEntity[]>;
  getVerifiedSellers(): Promise<SellerProfileEntity[]>;

  // User with Seller Profile combined queries
  getUserWithSellerProfile(userId: string): Promise<{
    user: UserEntity;
    sellerProfile: SellerProfileEntity | null;
  } | null>;
}
