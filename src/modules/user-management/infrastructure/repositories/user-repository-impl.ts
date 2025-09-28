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

  async getUserById(id: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM ${this.usersTable}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return UserMapper.toDomain(result.rows[0]);
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

  async updateUser(id: string, user: UserEntity): Promise<UserEntity> {
    const userData = UserMapper.toPersistence(user);

    const query = `
      UPDATE ${this.usersTable}
      SET email = $1, password = $2, name = $3,
          role = $4, status = $5, email_verified = $6, phone = $7, updated_at = $8
      WHERE id = $9 AND deleted_at IS NULL
    `;

    const params = [
      userData.email,
      userData.password,
      userData.name,
      userData.role,
      userData.status,
      userData.email_verified,
      userData.phone,
      userData.updated_at,
      id,
    ];

    await this.databaseService.query(query, params);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const query = `
      UPDATE ${this.usersTable}
      SET deleted_at = NOW()
      WHERE id = $1
    `;

    await this.databaseService.query(query, [id]);
  }

  async getUsersByRole(role: string): Promise<UserEntity[]> {
    const query = `
      SELECT * FROM ${this.usersTable}
      WHERE role = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.query(query, [role]);
    return result.rows.map((row: any) => UserMapper.toDomain(row));
  }

  async getUsersByStatus(status: string): Promise<UserEntity[]> {
    const query = `
      SELECT * FROM ${this.usersTable}
      WHERE status = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.query(query, [status]);
    return result.rows.map((row: any) => UserMapper.toDomain(row));
  }

  async searchUsers(searchParams: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: UserEntity[]; total: number }> {
    const conditions: string[] = ["deleted_at IS NULL"];
    const params: any[] = [];
    let paramIndex = 1;

    if (searchParams.email) {
      conditions.push(`email LIKE $${paramIndex++}`);
      params.push(`%${searchParams.email}%`);
    }

    if (searchParams.firstName) {
      conditions.push(`name LIKE $${paramIndex++}`);
      params.push(`%${searchParams.firstName}%`);
    }

    if (searchParams.lastName) {
      conditions.push(`name LIKE $${paramIndex++}`);
      params.push(`%${searchParams.lastName}%`);
    }

    if (searchParams.role) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(searchParams.role);
    }

    if (searchParams.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(searchParams.status);
    }

    const whereClause = conditions.join(" AND ");

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ${this.usersTable} WHERE ${whereClause}`;
    const countResult = await this.databaseService.query(countQuery, params);
    const total = countResult.rows[0].total;

    // Data query with pagination
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 25;
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT * FROM ${this.usersTable}
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataResult = await this.databaseService.query(dataQuery, [
      ...params,
      limit,
      offset,
    ]);
    const users = dataResult.rows.map((row: any) => UserMapper.toDomain(row));

    return { users, total };
  }

  async verifyUserEmail(userId: string): Promise<void> {
    const query = `
      UPDATE ${this.usersTable}
      SET email_verified = true, updated_at = NOW()
      WHERE id = $1
    `;

    await this.databaseService.query(query, [userId]);
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string
  ): Promise<void> {
    const query = `
      UPDATE ${this.usersTable}
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;

    await this.databaseService.query(query, [passwordHash, userId]);
  }

  // Seller Profile Methods
  async createSellerProfile(
    sellerProfile: SellerProfileEntity
  ): Promise<SellerProfileEntity> {
    const profileData = SellerProfileMapper.toPersistence(sellerProfile);

    const query = `
      INSERT INTO ${this.sellerProfilesTable}
      (id, user_id, business_name, business_description, business_address,
       business_phone, business_email, tax_id, business_license, commission_rate,
       is_verified, bank_account_details, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const params = [
      profileData.id,
      profileData.user_id,
      profileData.business_name,
      profileData.business_description,
      JSON.stringify(profileData.business_address),
      profileData.business_phone,
      profileData.business_email,
      profileData.tax_id,
      profileData.business_license,
      profileData.commission_rate,
      profileData.is_verified,
      profileData.bank_account_details
        ? JSON.stringify(profileData.bank_account_details)
        : null,
      profileData.created_at,
      profileData.updated_at,
    ];

    await this.databaseService.query(query, params);
    return sellerProfile;
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

  async getSellerProfileById(id: string): Promise<SellerProfileEntity | null> {
    const query = `
      SELECT * FROM ${this.sellerProfilesTable}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return SellerProfileMapper.toDomain(result.rows[0]);
  }

  async updateSellerProfile(
    id: string,
    sellerProfile: SellerProfileEntity
  ): Promise<SellerProfileEntity> {
    const profileData = SellerProfileMapper.toPersistence(sellerProfile);

    const query = `
      UPDATE ${this.sellerProfilesTable}
      SET business_name = $1, business_description = $2, business_address = $3,
          business_phone = $4, business_email = $5, tax_id = $6, business_license = $7,
          commission_rate = $8, is_verified = $9, bank_account_details = $10, updated_at = $11
      WHERE id = $12 AND deleted_at IS NULL
    `;

    const params = [
      profileData.business_name,
      profileData.business_description,
      JSON.stringify(profileData.business_address),
      profileData.business_phone,
      profileData.business_email,
      profileData.tax_id,
      profileData.business_license,
      profileData.commission_rate,
      profileData.is_verified,
      profileData.bank_account_details
        ? JSON.stringify(profileData.bank_account_details)
        : null,
      profileData.updated_at,
      id,
    ];

    await this.databaseService.query(query, params);
    return sellerProfile;
  }

  async deleteSellerProfile(id: string): Promise<void> {
    const query = `
      UPDATE ${this.sellerProfilesTable}
      SET deleted_at = NOW()
      WHERE id = $1
    `;

    await this.databaseService.query(query, [id]);
  }

  async getPendingSellerProfiles(): Promise<SellerProfileEntity[]> {
    const query = `
      SELECT sp.* FROM ${this.sellerProfilesTable} sp
      JOIN ${this.usersTable} u ON sp.user_id = u.id
      WHERE u.status = 'PENDING_APPROVAL'
        AND sp.deleted_at IS NULL
        AND u.deleted_at IS NULL
      ORDER BY sp.created_at ASC
    `;

    const result = await this.databaseService.query(query);
    return result.rows.map((row: any) => SellerProfileMapper.toDomain(row));
  }

  async getVerifiedSellers(): Promise<SellerProfileEntity[]> {
    const query = `
      SELECT sp.* FROM ${this.sellerProfilesTable} sp
      JOIN ${this.usersTable} u ON sp.user_id = u.id
      WHERE sp.is_verified = true
        AND u.status = 'ACTIVE'
        AND sp.deleted_at IS NULL
        AND u.deleted_at IS NULL
      ORDER BY sp.created_at DESC
    `;

    const result = await this.databaseService.query(query);
    return result.rows.map((row: any) => SellerProfileMapper.toDomain(row));
  }

  async getUserWithSellerProfile(userId: string): Promise<{
    user: UserEntity;
    sellerProfile: SellerProfileEntity | null;
  } | null> {
    const userQuery = `
      SELECT * FROM ${this.usersTable}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const userResult = await this.databaseService.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = UserMapper.toDomain(userResult.rows[0]);
    let sellerProfile: SellerProfileEntity | null = null;

    if (user.isSeller()) {
      const profileQuery = `
        SELECT * FROM ${this.sellerProfilesTable}
        WHERE user_id = $1 AND deleted_at IS NULL
      `;

      const profileResult = await this.databaseService.query(profileQuery, [
        userId,
      ]);

      if (profileResult.rows.length > 0) {
        sellerProfile = SellerProfileMapper.toDomain(profileResult.rows[0]);
      }
    }

    return { user, sellerProfile };
  }
}
