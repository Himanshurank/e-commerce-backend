import { IUserRepository } from "../../domain/interfaces/infrastructure/repositories/userRepository";
import { User } from "../../domain/entities/auth/user";
import {
  TUserRecord,
  TCreateUserParams,
} from "../../domain/types/infrastructure/repositories/userRepository";
import { UserRole } from "../../domain/enum/userRole";
import { UserStatus } from "../../domain/enum/userStatus";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { randomUUID } from "crypto";

export class UserRepoImpl implements IUserRepository {
  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async create(params: TCreateUserParams): Promise<User> {
    try {
      const userId = randomUUID();
      const now = new Date();

      const query = `
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, phone, role, status,
          email_verified, login_count, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        userId,
        params.email,
        params.password,
        params.firstName,
        params.lastName,
        params.phone || null,
        params.role || UserRole.CUSTOMER,
        UserStatus.APPROVED, // Auto-approve for now
        false, // Email not verified initially
        0, // Initial login count
        now,
        now,
      ];

      const results = await this.databaseService.insert<TUserRecord>(
        query,
        values,
        "createUser"
      );

      if (!results[0]) {
        throw new Error("Failed to create user");
      }

      return User.create(results[0]);
    } catch (error: any) {
      this.logger.error("Failed to create user", {
        email: params.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users
        WHERE id = $1 AND deleted_at IS NULL
      `;

      const results = await this.databaseService.select<TUserRecord>(
        query,
        [id],
        "findUserById"
      );

      return results.length > 0 && results[0] ? User.create(results[0]) : null;
    } catch (error: any) {
      this.logger.error("Failed to find user by ID", {
        userId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users
        WHERE email = $1 AND deleted_at IS NULL
      `;

      const results = await this.databaseService.select<TUserRecord>(
        query,
        [email],
        "findUserByEmail"
      );

      return results.length > 0 && results[0] ? User.create(results[0]) : null;
    } catch (error: any) {
      this.logger.error("Failed to find user by email", {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM users
        WHERE email = $1 AND deleted_at IS NULL
      `;

      const results = await this.databaseService.select<{ count: string }>(
        query,
        [email],
        "checkEmailExists"
      );

      return parseInt(results[0]?.count || "0", 10) > 0;
    } catch (error: any) {
      this.logger.error("Failed to check if email exists", {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async update(id: string, params: Partial<TCreateUserParams>): Promise<User> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (params.email !== undefined) {
        setParts.push(`email = $${paramIndex++}`);
        values.push(params.email);
      }

      if (params.firstName !== undefined) {
        setParts.push(`first_name = $${paramIndex++}`);
        values.push(params.firstName);
      }

      if (params.lastName !== undefined) {
        setParts.push(`last_name = $${paramIndex++}`);
        values.push(params.lastName);
      }

      if (params.phone !== undefined) {
        setParts.push(`phone = $${paramIndex++}`);
        values.push(params.phone);
      }

      if (params.role !== undefined) {
        setParts.push(`role = $${paramIndex++}`);
        values.push(params.role);
      }

      setParts.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());

      values.push(id); // For WHERE clause

      const query = `
        UPDATE users
        SET ${setParts.join(", ")}
        WHERE id = $${paramIndex} AND deleted_at IS NULL
        RETURNING *
      `;

      const results = await this.databaseService.update<TUserRecord>(
        query,
        values,
        "updateUser"
      );

      if (!results[0]) {
        throw new Error("User not found or update failed");
      }

      return User.create(results[0]);
    } catch (error: any) {
      this.logger.error("Failed to update user", {
        userId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const query = `
        UPDATE users
        SET deleted_at = $1, updated_at = $1, is_active = false
        WHERE id = $2 AND deleted_at IS NULL
      `;

      await this.databaseService.update(query, [new Date(), id], "deleteUser");
    } catch (error: any) {
      this.logger.error("Failed to delete user", {
        userId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAll(limit: number = 20, offset: number = 0): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const results = await this.databaseService.select<TUserRecord>(
        query,
        [limit, offset],
        "findAllUsers"
      );

      return results.map((record) => User.create(record));
    } catch (error: any) {
      this.logger.error("Failed to find all users", {
        limit,
        offset,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM users
        WHERE deleted_at IS NULL
      `;

      const results = await this.databaseService.select<{ count: string }>(
        query,
        [],
        "countUsers"
      );

      return parseInt(results[0]?.count || "0", 10);
    } catch (error: any) {
      this.logger.error("Failed to count users", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
