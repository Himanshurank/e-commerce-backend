import { User } from "../../../entities/auth/user";
import { TCreateUserParams } from "../../../types/infrastructure/repositories/userRepository";

export interface IUserRepository {
  /**
   * Create a new user
   */
  create(params: TCreateUserParams): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Check if email already exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Update user information
   */
  update(id: string, params: Partial<TCreateUserParams>): Promise<User>;

  /**
   * Soft delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Get all users with pagination
   */
  findAll(limit?: number, offset?: number): Promise<User[]>;

  /**
   * Count total users
   */
  count(): Promise<number>;
}

