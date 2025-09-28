import { UserEntity } from "../domain/entities/user-entity";
import { SellerProfileEntity } from "../domain/entities/seller-profile-entity";

export interface UserRepositoryInterface {
  // Core user operations (currently used)
  createUser(user: UserEntity): Promise<UserEntity>;
  getUserByEmail(email: string): Promise<UserEntity | null>;

  // Seller profile operations (used in login)
  getSellerProfileByUserId(userId: string): Promise<SellerProfileEntity | null>;
}
