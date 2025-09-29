# Clean Architecture Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Layer Structure](#layer-structure)
4. [Implementation Patterns](#implementation-patterns)
5. [Development Workflow](#development-workflow)
6. [Code Standards](#code-standards)
7. [Examples](#examples)

---

## Overview

This document defines the **Clean Architecture** implementation standard for TypeScript Node.js projects. It ensures consistent, maintainable, and testable code across all projects by enforcing strict layer dependencies and interface-based design.

### Core Philosophy

- **Dependency Inversion**: Higher layers depend on interfaces, not implementations
- **Single Responsibility**: Each layer has one clear purpose
- **Interface Segregation**: Small, focused interfaces over large ones
- **Testability**: Easy to mock and test each layer independently

---

## Architecture Principles

### 1. **Dependency Direction Rule**

Dependencies flow **inward only**:

```
Presentation → Application → Infrastructure → Domain ← Shared
```

### 2. **Interface-First Design**

- Every class implements an interface defined in the domain layer
- Never import concrete implementations across layers
- Use dependency injection for all external dependencies

### 3. **Layer Isolation**

- Each layer can only import from layers below it
- Domain layer has no external dependencies
- Shared layer provides cross-cutting concerns

### 4. **Naming Conventions**

- **Interfaces**: `I` prefix (`IUserRepository`, `IEmailService`)
- **Types**: `T` prefix (`TUserRecord`, `TCreateUserParams`)
- **Enums**: PascalCase (`UserStatus`, `DataType`)
- **Files**: camelCase for classes, kebab-case for utilities

---

## Layer Structure

```
src/
├── domain/                 # Core business logic (innermost layer)
│   ├── entities/          # Business entities with validation
│   ├── enum/              # Business enumerations
│   ├── interfaces/        # Contracts for all layers
│   │   ├── application/   # Use case contracts
│   │   ├── infrastructure/# Repository & service contracts
│   │   └── presentation/  # Controller contracts
│   └── types/             # Data shape definitions
│       ├── application/   # Use case parameter types
│       └── infrastructure/# Repository & service types
├── application/           # Business logic orchestration
│   ├── Dto/              # Data transfer objects
│   ├── mappers/          # Data transformation logic
│   ├── services/         # Business services
│   └── usecases/         # Business use cases
├── infrastructure/        # External concerns implementation
│   ├── externalServices/ # Third-party service wrappers
│   ├── factories/        # Complex object construction
│   └── repositories/     # Data persistence implementation
├── presentation/          # HTTP interface layer
│   ├── controllers/      # HTTP request handlers
│   ├── factories/        # Controller dependency wiring
│   ├── routes/           # Route definitions
│   └── validation/       # Input validation schemas
└── shared/               # Cross-layer utilities
    ├── constants/        # Application constants
    ├── core/            # Shared interfaces
    ├── middlewares/     # HTTP middlewares
    ├── services/        # Infrastructure services
    └── utils/           # Utility functions
```

---

## Implementation Patterns

### 1. Domain Layer Patterns

#### Entity Pattern

```typescript
// domain/entities/[feature]/[entity].ts
import { T[Entity]Record } from "../../types/infrastructure/repositories/[entity]Repository";
import { [Status] } from "../../enum/[status]";

interface Props {
  id: string;
  name: string;
  status: [Status];
  createdAt: Date;
  updatedAt: Date;
  // Optional fields with defaults
  isActive?: boolean;
  deletedAt?: Date | null;
}

export class [Entity] {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _status: [Status];
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private _isActive: boolean;
  private _deletedAt: Date | null;

  constructor({
    id,
    name,
    status,
    createdAt,
    updatedAt,
    isActive = true,
    deletedAt = null,
  }: Props) {
    this._id = id;
    this._name = name;
    this._status = status;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._isActive = isActive;
    this._deletedAt = deletedAt;

    this.validate();
  }

  // Static factory for database records
  static create(params: T[Entity]Record): [Entity] {
    return new [Entity]({
      id: params.id,
      name: params.name,
      status: params.status,
      createdAt: params.created_at,
      updatedAt: params.updated_at,
      isActive: params.is_active,
      deletedAt: params.deleted_at,
    });
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get status(): [Status] { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get isActive(): boolean { return this._isActive; }
  get deletedAt(): Date | null { return this._deletedAt; }

  // Business methods
  public canBeDeleted(): boolean {
    return this._isActive && !this._deletedAt;
  }

  public deactivate(): [Entity] {
    return new [Entity]({
      ...this.toDomainProps(),
      isActive: false,
      updatedAt: new Date(),
    });
  }

  private validate(): void {
    if (!this._id) {
      throw new Error("[Entity] id is required");
    }
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("[Entity] name is required");
    }
    if (!Object.values([Status]).includes(this._status)) {
      throw new Error("[Entity] status must be valid");
    }
  }

  private toDomainProps(): Props {
    return {
      id: this._id,
      name: this._name,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isActive: this._isActive,
      deletedAt: this._deletedAt,
    };
  }
}
```

#### Interface Pattern

```typescript
// domain/interfaces/infrastructure/repositories/[entity]Repository.ts
import { [Entity] } from "../../../entities/[feature]/[entity]";
import { TCreate[Entity]Params, T[Entity]Record } from "../../../types/infrastructure/repositories/[entity]Repository";

export interface I[Entity]Repository {
  create(params: TCreate[Entity]Params): Promise<[Entity]>;
  findById(id: string): Promise<[Entity] | null>;
  findByUserId(userId: string): Promise<[Entity][]>;
  update(id: string, params: Partial<TCreate[Entity]Params>): Promise<[Entity]>;
  delete(id: string): Promise<void>;
  // Additional business-specific methods
  findByNameAndUserId(name: string, userId: string): Promise<[Entity] | null>;
}
```

#### Type Pattern

```typescript
// domain/types/infrastructure/repositories/[entity]Repository.ts
import { [Status] } from "../../../enum/[status]";

export type T[Entity]Record = {
  id: string;
  user_id: string;
  name: string;
  status: [Status];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type TCreate[Entity]Params = {
  userId: string;
  name: string;
  status: [Status];
};

export type TUpdate[Entity]Params = {
  name?: string;
  status?: [Status];
  isActive?: boolean;
};
```

#### Enum Pattern

```typescript
// domain/enum/[enumName].ts
/**
 * [Description of what this enum represents]
 * Used by: [Entity1], [Entity2], [Feature] APIs
 */
export enum [EnumName] {
  [VALUE1] = "[value1]",
  [VALUE2] = "[value2]",
  [VALUE3] = "[value3]",
}
```

### 2. Application Layer Patterns

#### Use Case Pattern

```typescript
// application/usecases/[feature]/[action][Entity]UseCase.ts
import { I[Entity]Repository } from "../../../domain/interfaces/infrastructure/repositories/[entity]Repository";
import { ILoggerService } from "../../../shared/core/interfaces/services/loggerService";
import { [Action][Entity]RequestDto } from "../../Dto/[feature]/[action][Entity]";
import { [Entity] } from "../../../domain/entities/[feature]/[entity]";

export class [Action][Entity]UseCase {
  constructor(
    private readonly [entity]Repository: I[Entity]Repository,
    private readonly logger: ILoggerService,
    // Additional services as needed
    private readonly [optional]Service?: I[Optional]Service
  ) {}

  async execute(params: [Action][Entity]RequestDto): Promise<[Entity]> {
    try {
      this.logger.info("Executing [action][entity] use case", {
        [contextField]: params.[contextField]
      });

      // 1. Business validation
      const existing = await this.[entity]Repository.findByNameAndUserId(
        params.name,
        params.userId
      );

      if (existing && shouldPreventDuplicates) {
        this.logger.error("[Entity] already exists", {
          name: params.name,
          userId: params.userId,
        });
        throw new Error("[Entity] already exists");
      }

      // 2. Main business logic
      const [entity] = await this.[entity]Repository.create({
        userId: params.userId,
        name: params.name,
        status: params.status,
      });

      // 3. Side effects (optional)
      if (this.[optional]Service) {
        await this.[optional]Service.performSideEffect([entity].id);
      }

      this.logger.info("[Action][entity] completed successfully", {
        [entity]Id: [entity].id,
      });

      return [entity]; // Always return entities, never DTOs
    } catch (error) {
      this.logger.error("[Action][entity] use case failed", {
        error,
        [contextField]: params.[contextField],
      });
      throw error;
    }
  }
}
```

#### DTO Pattern

```typescript
// application/Dto/[feature]/[action][Entity].ts
import { [Status] } from "../../../domain/entities/[feature]/[entity]";
import { [Entity] } from "../../../domain/entities/[feature]/[entity]";

export class [Action][Entity]RequestDto {
  constructor(
    public name: string,
    public status: [Status],
    public userId: string,
    public optionalField?: string
  ) {}

  static fromDto(req: any): [Action][Entity]RequestDto {
    return new [Action][Entity]RequestDto(
      req.body.name,
      req.body.status,
      req.user.userId, // From auth middleware
      req.body.optionalField
    );
  }
}

export class [Action][Entity]ResponseDto {
  constructor(
    public id: string,
    public name: string,
    public status: string,
    public createdAt: string
  ) {}

  static toDto([entity]: [Entity]): [Action][Entity]ResponseDto {
    return new [Action][Entity]ResponseDto(
      [entity].id,
      [entity].name,
      [entity].status,
      [entity].createdAt.toISOString()
    );
  }
}
```

### 3. Infrastructure Layer Patterns

#### Repository Pattern

```typescript
// infrastructure/repositories/[entity]RepoImpl.ts
import { I[Entity]Repository } from "../../domain/interfaces/infrastructure/repositories/[entity]Repository";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { [Entity] } from "../../domain/entities/[feature]/[entity]";
import {
  TCreate[Entity]Params,
  T[Entity]Record
} from "../../domain/types/infrastructure/repositories/[entity]Repository";
import { IdGeneratorService } from "../externalServices/idGeneratorService";

export class [Entity]RepoImpl implements I[Entity]Repository {
  private readonly tableName = "[table_name]";

  constructor(private readonly databaseService: IDatabaseService) {}

  async create(params: TCreate[Entity]Params): Promise<[Entity]> {
    const [entity] = [Entity].create({
      id: IdGeneratorService.getInstance().generateUUID(),
      user_id: params.userId,
      name: params.name,
      status: params.status,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    const query = `
      INSERT INTO ${this.tableName} (
        id, user_id, name, status, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      [entity].id,
      [entity].userId,
      [entity].name,
      [entity].status,
      [entity].isActive,
      [entity].createdAt,
      [entity].updatedAt,
    ];

    await this.databaseService.insert(query, values, "create[Entity]");
    return [entity];
  }

  async findById(id: string): Promise<[Entity] | null> {
    const query = `
      SELECT id, user_id, name, status, is_active, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<T[Entity]Record>(
      query,
      [id],
      "find[Entity]ById"
    );

    return result[0] ? [Entity].create(result[0]) : null;
  }

  async findByUserId(userId: string): Promise<[Entity][]> {
    const query = `
      SELECT id, user_id, name, status, is_active, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.select<T[Entity]Record>(
      query,
      [userId],
      "find[Entity]ByUserId"
    );

    return result.map([entity]Record => [Entity].create([entity]Record));
  }

  async update(id: string, params: Partial<TCreate[Entity]Params>): Promise<[Entity]> {
    const setParts: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;

    if (params.name !== undefined) {
      setParts.push(`name = $${paramIndex}`);
      values.push(params.name);
      paramIndex++;
    }

    if (params.status !== undefined) {
      setParts.push(`status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    setParts.push(`updated_at = NOW()`);

    const query = `
      UPDATE ${this.tableName}
      SET ${setParts.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    await this.databaseService.update(query, values, "update[Entity]");

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("[Entity] not found after update");
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET deleted_at = NOW()
      WHERE id = $1
    `;

    await this.databaseService.update(query, [id], "delete[Entity]");
  }

  async findByNameAndUserId(name: string, userId: string): Promise<[Entity] | null> {
    const query = `
      SELECT id, user_id, name, status, is_active, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE name = $1 AND user_id = $2 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<T[Entity]Record>(
      query,
      [name, userId],
      "find[Entity]ByNameAndUserId"
    );

    return result[0] ? [Entity].create(result[0]) : null;
  }
}
```

#### External Service Pattern

```typescript
// infrastructure/externalServices/[service]Service.ts
import { I[Service]Service } from "../../domain/interfaces/infrastructure/externalServices/[service]Service";
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import { T[Service]Params, T[Service]Result } from "../../domain/types/infrastructure/externalServices/[service]Service";

export class [Service]Service implements I[Service]Service {
  constructor(
    private readonly client: [ThirdParty]Client,
    private readonly logger: ILoggerService
  ) {
    // Validate environment variables when using process.env directly
    const requiredConfig = process.env.[SERVICE]_CONFIG;
    if (!requiredConfig || requiredConfig.trim() === "") {
      throw new Error("[SERVICE]_CONFIG environment variable is required");
    }
  }

  async performAction(params: T[Service]Params): Promise<T[Service]Result> {
    try {
      this.logger.info("Performing [service] action", {
        action: params.action
      });

      const response = await this.client.performAction({
        param1: params.param1,
        param2: params.param2,
      });

      return this.mapResponse(response);
    } catch (error) {
      this.logger.error("[Service] action failed", {
        error,
        action: params.action
      });
      throw new Error("Failed to perform [service] action");
    }
  }

  private mapResponse(response: [ThirdParty]Response): T[Service]Result {
    return {
      id: response.id,
      status: response.status,
      data: response.data,
    };
  }
}
```

### 4. Presentation Layer Patterns

#### Controller Pattern

```typescript
// presentation/controllers/[feature]Controller.ts
import { Request, Response } from "express";
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import { HTTP_STATUS_CODES, API_MESSAGES } from "../../shared/constants/constants";
import { I[Feature]Controller } from "../../domain/interfaces/presentation/controllers/[feature]Controller";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { ApiError } from "../../shared/utils/ApiError";

// Import DTOs
import {
  [Action1][Entity]RequestDto,
  [Action1][Entity]ResponseDto,
} from "../../application/Dto/[feature]/[action1][Entity]";

// Import Use Cases
import { [Action1][Entity]UseCase } from "../../application/usecases/[feature]/[action1][Entity]UseCase";
import { [Action2][Entity]UseCase } from "../../application/usecases/[feature]/[action2][Entity]UseCase";

export class [Feature]Controller implements I[Feature]Controller {
  constructor(
    private readonly logger: ILoggerService,
    private readonly [action1][Entity]UseCase: [Action1][Entity]UseCase,
    private readonly [action2][Entity]UseCase: [Action2][Entity]UseCase,
    // Additional use cases...
  ) {}

  public async [action1][Entity](req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Processing [action1][entity] request");

      const params = [Action1][Entity]RequestDto.fromDto(req);
      const [entity] = await this.[action1][Entity]UseCase.execute(params);
      const response = [Action1][Entity]ResponseDto.toDto([entity]);

      this.logger.info("[action1][entity] request completed");
      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json(new ApiResponse(HTTP_STATUS_CODES.CREATED, response, API_MESSAGES.CREATED));
    } catch (error: any) {
      this.logger.error("[action1][entity] request failed", {
        error: error.message || "Unknown error",
      });

      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            error.message || API_MESSAGES.CREATION_FAILED,
            error.errors || [],
            error.stack || ""
          )
        );
    }
  }

  public async [action2][Entity](req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Processing [action2][entity] request");

      const params = [Action2][Entity]RequestDto.fromDto(req);
      const [entity] = await this.[action2][Entity]UseCase.execute(params);
      const response = [Action2][Entity]ResponseDto.toDto([entity]);

      this.logger.info("[action2][entity] request completed");
      res
        .status(HTTP_STATUS_CODES.OK)
        .json(new ApiResponse(HTTP_STATUS_CODES.OK, response, API_MESSAGES.SUCCESS));
    } catch (error: any) {
      this.logger.error("[action2][entity] request failed", {
        error: error.message || "Unknown error",
      });

      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            error.message || API_MESSAGES.FAILED_TO_GET_DATA,
            error.errors || [],
            error.stack || ""
          )
        );
    }
  }
}
```

#### Route Pattern

```typescript
// presentation/routes/[feature]Routes.ts
import { Router } from "express";
import { createValidator } from "express-joi-validation";
import { [Feature]ControllerFactory } from "../factories/[feature]ControllerFactory";
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import { I[Feature]Controller } from "../../domain/interfaces/presentation/controllers/[feature]Controller";
import { [feature]ValidationSchemas } from "../validation/[feature]ValidationSchemas";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";

export class [Feature]Routes {
  private router = Router();
  private [feature]Controller!: I[Feature]Controller;

  constructor(
    private logger: ILoggerService,
    private databaseService: IDatabaseService,
    // Additional services as needed
    private [optional]Service?: I[Optional]Service
  ) {
    this.[feature]Controller = [Feature]ControllerFactory.create(
      this.logger,
      this.databaseService,
      this.[optional]Service
    );
    this.setupRoutes();
  }

  private setupRoutes(): void {
    const validator = createValidator({ passError: true });

    // POST /[feature] - Create new [entity]
    this.router.post(
      "/",
      validator.body([feature]ValidationSchemas.[action1][Entity]),
      this.[feature]Controller.[action1][Entity].bind(this.[feature]Controller)
    );

    // GET /[feature]/:id - Get [entity] by ID
    this.router.get(
      "/:id",
      validator.params([feature]ValidationSchemas.[action2][Entity]),
      this.[feature]Controller.[action2][Entity].bind(this.[feature]Controller)
    );

    // PUT /[feature]/:id - Update [entity]
    this.router.put(
      "/:id",
      validator.params([feature]ValidationSchemas.[action3][Entity]Params),
      validator.body([feature]ValidationSchemas.[action3][Entity]Body),
      this.[feature]Controller.[action3][Entity].bind(this.[feature]Controller)
    );

    // DELETE /[feature]/:id - Delete [entity]
    this.router.delete(
      "/:id",
      validator.params([feature]ValidationSchemas.[action4][Entity]),
      this.[feature]Controller.[action4][Entity].bind(this.[feature]Controller)
    );

    // GET /[feature] - Get all [entity] for user
    this.router.get(
      "/",
      this.[feature]Controller.[action5][Entity].bind(this.[feature]Controller)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
```

#### Validation Pattern

```typescript
// presentation/validation/[feature]ValidationSchemas.ts
import Joi from "joi";
import { [Status] } from "../../domain/enum/[status]";

export const [feature]ValidationSchemas = {
  [action1][Entity]: Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
      "any.required": "Name is required",
      "string.min": "Name must be at least 1 character",
      "string.max": "Name cannot exceed 255 characters",
    }),
    status: Joi.string()
      .valid([Status].[VALUE1], [Status].[VALUE2], [Status].[VALUE3])
      .required()
      .messages({
        "any.required": "Status is required",
        "any.only": "Status must be one of: {#valids}",
      }),
    optionalField: Joi.string().optional().max(500).messages({
      "string.max": "Optional field cannot exceed 500 characters",
    }),
  }),

  [action2][Entity]: Joi.object({
    id: Joi.string().uuid().required().messages({
      "any.required": "[Entity] ID is required",
      "string.uuid": "[Entity] ID must be a valid UUID",
    }),
  }),

  [action3][Entity]Params: Joi.object({
    id: Joi.string().uuid().required().messages({
      "any.required": "[Entity] ID is required",
      "string.uuid": "[Entity] ID must be a valid UUID",
    }),
  }),

  [action3][Entity]Body: Joi.object({
    name: Joi.string().min(1).max(255).optional().messages({
      "string.min": "Name must be at least 1 character",
      "string.max": "Name cannot exceed 255 characters",
    }),
    status: Joi.string()
      .valid([Status].[VALUE1], [Status].[VALUE2], [Status].[VALUE3])
      .optional()
      .messages({
        "any.only": "Status must be one of: {#valids}",
      }),
  }),

  [action4][Entity]: Joi.object({
    id: Joi.string().uuid().required().messages({
      "any.required": "[Entity] ID is required",
      "string.uuid": "[Entity] ID must be a valid UUID",
    }),
  }),
};
```

#### Factory Pattern

```typescript
// presentation/factories/[feature]ControllerFactory.ts
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { I[Feature]Controller } from "../../domain/interfaces/presentation/controllers/[feature]Controller";

// Repository implementations
import { [Entity]RepoImpl } from "../../infrastructure/repositories/[entity]RepoImpl";

// Service factories
import { [Service]ServiceFactory } from "../../infrastructure/factories/[service]ServiceFactory";

// Use case implementations
import { [Action1][Entity]UseCase } from "../../application/usecases/[feature]/[action1][Entity]UseCase";
import { [Action2][Entity]UseCase } from "../../application/usecases/[feature]/[action2][Entity]UseCase";

// Controller implementation
import { [Feature]Controller } from "../controllers/[feature]Controller";

export class [Feature]ControllerFactory {
  static create(
    logger: ILoggerService,
    databaseService: IDatabaseService,
    [optional]Service?: I[Optional]Service
  ): I[Feature]Controller {
    // 1. Create repositories
    const [entity]Repository = new [Entity]RepoImpl(databaseService);

    // 2. Create services via factories
    const [service]Service = [Service]ServiceFactory.create(
      databaseService,
      logger
    );

    // 3. Create use cases with dependency injection
    const [action1][Entity]UseCase = new [Action1][Entity]UseCase(
      [entity]Repository,
      logger,
      [service]Service
    );

    const [action2][Entity]UseCase = new [Action2][Entity]UseCase(
      [entity]Repository,
      logger
    );

    // Additional use cases...

    // 4. Return controller with all use cases
    return new [Feature]Controller(
      logger,
      [action1][Entity]UseCase,
      [action2][Entity]UseCase,
      // Additional use cases...
    );
  }
}
```

---

## Development Workflow

### Step-by-Step Implementation Process

#### 1. **Define Domain Contracts** (Always First)

```bash
# Create domain structure
src/domain/
├── entities/[feature]/[entity].ts
├── enum/[enumName].ts
├── interfaces/
│   ├── application/usecases/[feature]/[action][Entity]UseCase.ts
│   ├── infrastructure/repositories/[entity]Repository.ts
│   └── presentation/controllers/[feature]Controller.ts
└── types/
    ├── application/usecases/[feature]/[action][Entity].ts
    └── infrastructure/repositories/[entity]Repository.ts
```

**Implementation Order:**

1. Create enums in `domain/enum/`
2. Define entity with Props interface and validation
3. Create repository interface in `domain/interfaces/infrastructure/repositories/`
4. Define types for database records in `domain/types/infrastructure/repositories/`
5. Create use case interfaces in `domain/interfaces/application/usecases/`
6. Define use case parameter types in `domain/types/application/usecases/`

#### 2. **Design Application Layer**

```bash
# Create application structure
src/application/
├── Dto/[feature]/
│   ├── [action1][Entity].ts
│   └── [action2][Entity].ts
├── usecases/[feature]/
│   ├── [action1][Entity]UseCase.ts
│   └── [action2][Entity]UseCase.ts
└── services/[feature]/
    └── [service]Service.ts
```

**Implementation Order:**

1. Create request/response DTOs in `application/Dto/[feature]/`
2. Implement use cases with dependency injection
3. Add application services for complex business logic
4. Create mappers if transformation logic becomes repetitive

#### 3. **Implement Infrastructure Layer**

```bash
# Create infrastructure structure
src/infrastructure/
├── repositories/[entity]RepoImpl.ts
├── externalServices/[service]Service.ts
└── factories/[service]ServiceFactory.ts
```

**Implementation Order:**

1. Implement repository with database operations
2. Create external service wrappers
3. Build factories for complex service construction
4. Add database migrations if needed

#### 4. **Wire Presentation Layer**

```bash
# Create presentation structure
src/presentation/
├── controllers/[feature]Controller.ts
├── routes/[feature]Routes.ts
├── validation/[feature]ValidationSchemas.ts
└── factories/[feature]ControllerFactory.ts
```

**Implementation Order:**

1. Create Joi validation schemas
2. Implement controller with multiple use case injection
3. Create controller factory for dependency wiring
4. Define route class with validation middleware
5. Wire routes in main application

#### 5. **Integration & Testing**

1. Update main route manager to include new routes
2. Test API endpoints end-to-end
3. Add error handling and logging
4. Write unit tests for use cases
5. Add integration tests for repositories

---

## Code Standards

### 1. **File Naming Conventions**

- **Entities**: `[entity].ts` (e.g., `user.ts`, `project.ts`)
- **Interfaces**: `[entity]Repository.ts`, `[action][Entity]UseCase.ts`
- **Implementations**: `[entity]RepoImpl.ts`, `[action][Entity]UseCase.ts`
- **Controllers**: `[feature]Controller.ts`
- **Routes**: `[feature]Routes.ts`
- **DTOs**: `[action][Entity].ts`
- **Validation**: `[feature]ValidationSchemas.ts`

### 2. **Import Rules**

```typescript
// ✅ CORRECT - Relative imports for internal code
import { User } from "../../domain/entities/auth/user";
import { IUserRepository } from "../../domain/interfaces/infrastructure/repositories/userRepository";

// ✅ CORRECT - Absolute imports for node modules only
import express from "express";
import { v4 as uuidv4 } from "uuid";

// ❌ WRONG - Never import concrete implementations across layers
import { UserRepoImpl } from "../../infrastructure/repositories/userRepoImpl";

// ❌ WRONG - Never import from higher layers
import { UserController } from "../../presentation/controllers/userController";
```

### 3. **Dependency Injection Rules**

```typescript
// ✅ CORRECT - Inject interfaces
constructor(
  private readonly userRepository: IUserRepository,
  private readonly logger: ILoggerService
) {}

// ❌ WRONG - Never inject concrete classes
constructor(
  private readonly userRepository: UserRepoImpl,
  private readonly logger: LoggerService
) {}
```

### 4. **Error Handling Standards**

```typescript
// ✅ CORRECT - Use case error handling
async execute(params: CreateUserRequestDto): Promise<User> {
  try {
    this.logger.info("Creating user", { email: params.email });

    // Business logic here

    return user;
  } catch (error) {
    this.logger.error("Failed to create user", {
      error,
      email: params.email
    });
    throw error; // Always rethrow
  }
}

// ✅ CORRECT - Controller error handling
public async createUser(req: Request, res: Response): Promise<void> {
  try {
    const params = CreateUserRequestDto.fromDto(req);
    const user = await this.createUserUseCase.execute(params);
    const response = CreateUserResponseDto.toDto(user);

    res.status(HTTP_STATUS_CODES.CREATED)
       .json(new ApiResponse(HTTP_STATUS_CODES.CREATED, response, API_MESSAGES.CREATED));
  } catch (error: any) {
    this.logger.error("Create user request failed", { error: error.message });

    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
       .json(new ApiError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message));
  }
}
```

### 5. **Logging Standards**

```typescript
// ✅ CORRECT - Structured logging with context
this.logger.info("Creating user", {
  email: params.email,
  provider: params.provider,
});

this.logger.error("User creation failed", {
  error: error.message,
  email: params.email,
  stack: error.stack,
});

// ❌ WRONG - Logging sensitive data
this.logger.info("Creating user", {
  password: params.password, // Never log passwords
  token: params.token, // Never log tokens
});
```

---

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=your_database
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# External Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Third-party APIs
OPENAI_API_KEY=your-openai-key
SLACK_BOT_TOKEN=your-slack-token
```

---

## Examples

### Complete Feature Implementation Example

Let's implement a **User Management** feature following the complete workflow:

#### 1. Domain Layer Implementation

**Enum:**

```typescript
// src/domain/enum/userStatus.ts
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}
```

**Entity:**

```typescript
// src/domain/entities/auth/user.ts
import { TUserRecord } from "../../types/infrastructure/repositories/userRepository";
import { UserStatus } from "../../enum/userStatus";

interface Props {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  isVerified?: boolean;
  deletedAt?: Date | null;
}

export class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _status: UserStatus;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private _isVerified: boolean;
  private _deletedAt: Date | null;

  constructor({
    id,
    email,
    firstName,
    lastName,
    status,
    createdAt,
    updatedAt,
    isVerified = false,
    deletedAt = null,
  }: Props) {
    this._id = id;
    this._email = email;
    this._firstName = firstName;
    this._lastName = lastName;
    this._status = status;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._isVerified = isVerified;
    this._deletedAt = deletedAt;

    this.validate();
  }

  static create(params: TUserRecord): User {
    return new User({
      id: params.id,
      email: params.email,
      firstName: params.first_name,
      lastName: params.last_name,
      status: params.status as UserStatus,
      createdAt: params.created_at,
      updatedAt: params.updated_at,
      isVerified: params.is_verified,
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
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get status(): UserStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get isVerified(): boolean {
    return this._isVerified;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // Business methods
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE && !this._deletedAt;
  }

  public canBeDeleted(): boolean {
    return this._status !== UserStatus.DELETED && !this._deletedAt;
  }

  public verify(): User {
    return new User({
      ...this.toDomainProps(),
      isVerified: true,
      updatedAt: new Date(),
    });
  }

  private validate(): void {
    if (!this._id) {
      throw new Error("User id is required");
    }
    if (!this._email || !this.isValidEmail(this._email)) {
      throw new Error("Valid email is required");
    }
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new Error("First name is required");
    }
    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new Error("Last name is required");
    }
    if (!Object.values(UserStatus).includes(this._status)) {
      throw new Error("Valid user status is required");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private toDomainProps(): Props {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isVerified: this._isVerified,
      deletedAt: this._deletedAt,
    };
  }
}
```

**Repository Interface:**

```typescript
// src/domain/interfaces/infrastructure/repositories/userRepository.ts
import { User } from "../../../entities/auth/user";
import {
  TCreateUserParams,
  TUserRecord,
} from "../../../types/infrastructure/repositories/userRepository";

export interface IUserRepository {
  create(params: TCreateUserParams): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, params: Partial<TCreateUserParams>): Promise<User>;
  delete(id: string): Promise<void>;
  verifyUser(id: string): Promise<User>;
}
```

**Types:**

```typescript
// src/domain/types/infrastructure/repositories/userRepository.ts
import { UserStatus } from "../../../enum/userStatus";

export type TUserRecord = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: UserStatus;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type TCreateUserParams = {
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
};

export type TUpdateUserParams = {
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
};
```

#### 2. Application Layer Implementation

**DTOs:**

```typescript
// src/application/Dto/auth/createUser.ts
import { UserStatus } from "../../../domain/enum/userStatus";
import { User } from "../../../domain/entities/auth/user";

export class CreateUserRequestDto {
  constructor(
    public email: string,
    public firstName: string,
    public lastName: string,
    public status: UserStatus = UserStatus.ACTIVE
  ) {}

  static fromDto(req: any): CreateUserRequestDto {
    return new CreateUserRequestDto(
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.body.status || UserStatus.ACTIVE
    );
  }
}

export class CreateUserResponseDto {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public status: string,
    public isVerified: boolean,
    public createdAt: string
  ) {}

  static toDto(user: User): CreateUserResponseDto {
    return new CreateUserResponseDto(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.status,
      user.isVerified,
      user.createdAt.toISOString()
    );
  }
}
```

**Use Case:**

```typescript
// src/application/usecases/auth/createUserUseCase.ts
import { IUserRepository } from "../../../domain/interfaces/infrastructure/repositories/userRepository";
import { ILoggerService } from "../../../shared/core/interfaces/services/loggerService";
import { CreateUserRequestDto } from "../../Dto/auth/createUser";
import { User } from "../../../domain/entities/auth/user";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(params: CreateUserRequestDto): Promise<User> {
    try {
      this.logger.info("Creating user", { email: params.email });

      // Business validation
      const existingUser = await this.userRepository.findByEmail(params.email);
      if (existingUser) {
        this.logger.error("User already exists", { email: params.email });
        throw new Error("User with this email already exists");
      }

      // Create user
      const user = await this.userRepository.create({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        status: params.status,
      });

      this.logger.info("User created successfully", {
        userId: user.id,
        email: user.email,
      });

      return user;
    } catch (error) {
      this.logger.error("Failed to create user", {
        error,
        email: params.email,
      });
      throw error;
    }
  }
}
```

#### 3. Infrastructure Layer Implementation

**Repository:**

```typescript
// src/infrastructure/repositories/userRepoImpl.ts
import { IUserRepository } from "../../domain/interfaces/infrastructure/repositories/userRepository";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { User } from "../../domain/entities/auth/user";
import {
  TCreateUserParams,
  TUserRecord,
  TUpdateUserParams,
} from "../../domain/types/infrastructure/repositories/userRepository";
import { IdGeneratorService } from "../externalServices/idGeneratorService";

export class UserRepoImpl implements IUserRepository {
  private readonly tableName = "users";

  constructor(private readonly databaseService: IDatabaseService) {}

  async create(params: TCreateUserParams): Promise<User> {
    const user = User.create({
      id: IdGeneratorService.getInstance().generateUUID(),
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      status: params.status,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    const query = `
      INSERT INTO ${this.tableName} (
        id, email, first_name, last_name, status, is_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.status,
      user.isVerified,
      user.createdAt,
      user.updatedAt,
    ];

    await this.databaseService.insert(query, values, "createUser");
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, status, is_verified, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [id],
      "findUserById"
    );

    return result[0] ? User.create(result[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, status, is_verified, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE email = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [email],
      "findUserByEmail"
    );

    return result[0] ? User.create(result[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, email, first_name, last_name, status, is_verified, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [],
      "findAllUsers"
    );

    return result.map((userRecord) => User.create(userRecord));
  }

  async update(id: string, params: TUpdateUserParams): Promise<User> {
    const setParts: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;

    if (params.firstName !== undefined) {
      setParts.push(`first_name = $${paramIndex}`);
      values.push(params.firstName);
      paramIndex++;
    }

    if (params.lastName !== undefined) {
      setParts.push(`last_name = $${paramIndex}`);
      values.push(params.lastName);
      paramIndex++;
    }

    if (params.status !== undefined) {
      setParts.push(`status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    setParts.push(`updated_at = NOW()`);

    const query = `
      UPDATE ${this.tableName}
      SET ${setParts.join(", ")}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    await this.databaseService.update(query, values, "updateUser");

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("User not found after update");
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET deleted_at = NOW()
      WHERE id = $1
    `;

    await this.databaseService.update(query, [id], "deleteUser");
  }

  async verifyUser(id: string): Promise<User> {
    const query = `
      UPDATE ${this.tableName}
      SET is_verified = true, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    await this.databaseService.update(query, [id], "verifyUser");

    const verified = await this.findById(id);
    if (!verified) {
      throw new Error("User not found after verification");
    }

    return verified;
  }
}
```

#### 4. Presentation Layer Implementation

**Controller:**

```typescript
// src/presentation/controllers/authController.ts
import { Request, Response } from "express";
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import {
  HTTP_STATUS_CODES,
  API_MESSAGES,
} from "../../shared/constants/constants";
import { IAuthController } from "../../domain/interfaces/presentation/controllers/authController";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { ApiError } from "../../shared/utils/ApiError";

import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "../../application/Dto/auth/createUser";

import { CreateUserUseCase } from "../../application/usecases/auth/createUserUseCase";

export class AuthController implements IAuthController {
  constructor(
    private readonly logger: ILoggerService,
    private readonly createUserUseCase: CreateUserUseCase
  ) {}

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Processing createUser request");

      const params = CreateUserRequestDto.fromDto(req);
      const user = await this.createUserUseCase.execute(params);
      const response = CreateUserResponseDto.toDto(user);

      this.logger.info("createUser request completed");
      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json(
          new ApiResponse(
            HTTP_STATUS_CODES.CREATED,
            response,
            API_MESSAGES.CREATED
          )
        );
    } catch (error: any) {
      this.logger.error("createUser request failed", {
        error: error.message || "Unknown error",
      });

      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            error.message || API_MESSAGES.CREATION_FAILED,
            error.errors || [],
            error.stack || ""
          )
        );
    }
  }
}
```

**Routes:**

```typescript
// src/presentation/routes/authRoutes.ts
import { Router } from "express";
import { createValidator } from "express-joi-validation";
import { AuthControllerFactory } from "../factories/authControllerFactory";
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import { IAuthController } from "../../domain/interfaces/presentation/controllers/authController";
import { authValidationSchemas } from "../validation/authValidationSchemas";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";

export class AuthRoutes {
  private router = Router();
  private authController!: IAuthController;

  constructor(
    private logger: ILoggerService,
    private databaseService: IDatabaseService
  ) {
    this.authController = AuthControllerFactory.create(
      this.logger,
      this.databaseService
    );
    this.setupRoutes();
  }

  private setupRoutes(): void {
    const validator = createValidator({ passError: true });

    // POST /auth/users - Create new user
    this.router.post(
      "/users",
      validator.body(authValidationSchemas.createUser),
      this.authController.createUser.bind(this.authController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
```

**Validation:**

```typescript
// src/presentation/validation/authValidationSchemas.ts
import Joi from "joi";
import { UserStatus } from "../../domain/enum/userStatus";

export const authValidationSchemas = {
  createUser: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Email must be valid",
    }),
    firstName: Joi.string().min(1).max(100).required().messages({
      "any.required": "First name is required",
      "string.min": "First name must be at least 1 character",
      "string.max": "First name cannot exceed 100 characters",
    }),
    lastName: Joi.string().min(1).max(100).required().messages({
      "any.required": "Last name is required",
      "string.min": "Last name must be at least 1 character",
      "string.max": "Last name cannot exceed 100 characters",
    }),
    status: Joi.string()
      .valid(UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED)
      .optional()
      .default(UserStatus.ACTIVE)
      .messages({
        "any.only": "Status must be one of: active, inactive, suspended",
      }),
  }),
};
```

**Factory:**

```typescript
// src/presentation/factories/authControllerFactory.ts
import { ILoggerService } from "../../shared/core/interfaces/services/loggerService";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { IAuthController } from "../../domain/interfaces/presentation/controllers/authController";

import { UserRepoImpl } from "../../infrastructure/repositories/userRepoImpl";
import { CreateUserUseCase } from "../../application/usecases/auth/createUserUseCase";
import { AuthController } from "../controllers/authController";

export class AuthControllerFactory {
  static create(
    logger: ILoggerService,
    databaseService: IDatabaseService
  ): IAuthController {
    // 1. Create repositories
    const userRepository = new UserRepoImpl(databaseService);

    // 2. Create use cases
    const createUserUseCase = new CreateUserUseCase(userRepository, logger);

    // 3. Return controller
    return new AuthController(logger, createUserUseCase);
  }
}
```

This complete example demonstrates the full implementation workflow from domain to presentation layer, following all the established patterns and conventions.

---

## Conclusion

This Clean Architecture guide provides a comprehensive framework for building maintainable, testable, and scalable TypeScript applications. By following these patterns and conventions, teams can ensure consistency across projects and reduce development time through reusable architectural decisions.

### Key Benefits:

- **Maintainability**: Clear separation of concerns makes code easy to modify
- **Testability**: Interface-based design enables easy mocking and unit testing
- **Scalability**: Modular structure supports growth and feature additions
- **Consistency**: Standardized patterns reduce cognitive load and onboarding time
- **Flexibility**: Dependency inversion allows easy swapping of implementations

### Next Steps:

1. Set up the directory structure according to the patterns
2. Implement shared services and utilities first
3. Start with a simple feature following the complete workflow
4. Gradually add complexity as the team becomes comfortable with the patterns
5. Establish code review processes to ensure adherence to the standards

Remember: **Always start with the domain layer and work outward**. This ensures that business logic drives the architecture, not technical concerns.
/
