import { UserRepositoryInterface } from "../../repositories/user-repository-interface";
import { UserEntity } from "../../domain/entities/user-entity";
import { SellerProfileEntity } from "../../domain/entities/seller-profile-entity";
import { BaseRepository } from "../../../../shared/repositories/baseRepository";
import { UserMapper } from "../../mappers/user-mapper";
import { SellerProfileMapper } from "../../mappers/seller-profile-mapper";
import { DatabaseService } from "../../../../shared/infrastructure/services/databaseService";

export class UserRepositoryImpl
  extends BaseRepository
  implements UserRepositoryInterface
{
  private readonly usersTable = "users";
  private readonly sellerProfilesTable = "seller_profiles";

  constructor(private databaseService: DatabaseService) {
    super();
  }

  getConnectionType(): string {
    return "main";
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    const userData = UserMapper.toPersistence(user);

    const query = `
      INSERT INTO ${this.usersTable}
      (id, email, password, name, role, status, email_verified, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const params = [
      userData.id,
      userData.email,
      userData.password,
      userData.name,
      userData.role,
      userData.status,
      userData.email_verified,
      userData.phone,
      userData.created_at,
      userData.updated_at,
    ];

    await this.databaseService.query(query, params);
    return user;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM ${this.usersTable}
      WHERE email = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return UserMapper.toDomain(result.rows[0]);
  }

  async getSellerProfileByUserId(
    userId: string
  ): Promise<SellerProfileEntity | null> {
    const query = `
      SELECT * FROM ${this.sellerProfilesTable}
      WHERE user_id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return SellerProfileMapper.toDomain(result.rows[0]);
  }
}
