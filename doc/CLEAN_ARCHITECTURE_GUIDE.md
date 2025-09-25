# Clean Architecture Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Project Structure](#project-structure)
4. [Implementation Patterns](#implementation-patterns)
5. [Module Creation Guide](#module-creation-guide)
6. [Services and Routes Integration](#services-and-routes-integration)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Overview

This document provides a comprehensive guide for implementing Clean Architecture in Node.js/TypeScript projects, based on the implementation in **Avesta-Zeus**. This guide serves as a reference for creating new modules and maintaining consistency across projects.

Clean Architecture separates concerns into distinct layers, making the codebase more maintainable, testable, and independent of external frameworks.

## Architecture Layers

### 1. Domain Layer (`domain/`)

**Purpose:** Contains business logic and entities that are independent of external concerns.

**Components:**

- **Entities:** Core business objects with methods that encapsulate business rules
- **Interfaces:** Contracts for repositories and services
- **Services:** Domain-specific business logic

**Example Structure:**

```
domain/
├── entities/
│   ├── agencyDetails.ts
│   ├── agentDetails.ts
│   └── listingDetails.ts
├── interfaces/
│   └── interface.ts
└── services/
    └── staticMapImageServiceImpl.ts
```

**Entity Pattern:**

```typescript
export interface AgencyDetailsProps {
  id: number;
  name: string;
  // ... other properties
}

export class AgencyDetails {
  private props: AgencyDetailsProps;

  static create(details: AgencyDetailsProps) {
    const agencyDetails = new AgencyDetails();
    agencyDetails.props = details;
    return agencyDetails;
  }

  getDetails() {
    return this.props;
  }

  getId() {
    return this.props.id;
  }

  // ... other business methods
}
```

### 2. Application Layer (`application/`)

**Purpose:** Orchestrates business logic and coordinates between different layers.

**Components:**

- **Use Cases:** Application-specific business rules
- **DTOs:** Data Transfer Objects for request/response
- **Factories:** Dependency injection and object creation
- **Interfaces:** Application-level contracts

**Example Structure:**

```
application/
├── constants/
│   └── constants.ts
├── interfaces/
│   └── interface.ts
└── useCases/
    ├── getAgencyProfile/
    │   ├── getAgencyProfile.ts
    │   ├── getAgencyProfileFactory.ts
    │   ├── getAgencyProfileRequestDto.ts
    │   └── getAgencyProfileResponseDto.ts
    └── getAgentProfile/
        ├── getAgentProfile.ts
        ├── getAgentProfileFactory.ts
        ├── getAgentProfileRequestDto.ts
        └── getAgentProfileResponseDto.ts
```

**Use Case Pattern:**

```typescript
export class GetAgencyProfile {
  constructor(
    private agencyRepo: AgencyRepo,
    private agentRepo: AgentRepo,
    private listingRepo: ListingRepo // ... other dependencies
  ) {}

  async execute(
    request: GetAgencyProfileRequestDto
  ): Promise<GetAgencyProfileResponseDto> {
    // 1. Validate input
    // 2. Execute business logic
    // 3. Return response
    const agency = await this.agencyRepo.getDetailsById(request.id);
    // ... business logic
    return response;
  }
}
```

**Factory Pattern:**

```typescript
export class GetAgencyProfileFactory {
  static async create(req: any) {
    const revBase = RevBaseFactory.create(req);
    const indexResolver = new IndexResolverImpl();

    // Create repositories
    const agencyRepo = new AgencyRepoImpl(revBase, indexResolver);
    const agentRepo = new AgentRepoImpl(revBase, indexResolver);

    // Create services
    const staticMapImageService = new StaticMapImageServiceImpl(revBase);

    // Create use case
    const useCase = new GetAgencyProfile(
      agencyRepo,
      agentRepo
      // ... other dependencies
    );

    const loggerService = new RevBaseLoggerService(revBase);
    return { useCase, loggerService };
  }
}
```

### 3. Infrastructure Layer (`infrastructure/`)

**Purpose:** Implements external concerns like databases, APIs, and services.

**Components:**

- **Repositories:** Data access implementations
- **Services:** External service implementations
- **Query Builders:** Database query construction

**Example Structure:**

```
infrastructure/
├── repositories/
│   ├── agencyRepoImpl.ts
│   ├── agentRepoImpl.ts
│   ├── listingRepoImpl.ts
│   ├── agencyQueryBuilder.ts
│   └── listingQueryBuilder.ts
└── services/
    └── externalApiService.ts
```

**Repository Implementation Pattern:**

```typescript
export class AgencyRepoImpl extends BaseRepository implements AgencyRepo {
  constructor(
    revBase: RevAppServiceMain<EConnectionTypes, ESType, CacheType>,
    private indexResolver: IndexResolverImpl
  ) {
    super(revBase);
  }

  async getDetailsById(agencyId: number): Promise<AgencyDetails | void> {
    const query = new AgencyQueryBuilder().withAgencyId(agencyId).build();

    const result = await this.executeQuery(query);

    if (result.hits.hits.length > 0) {
      return AgencyDetailMapper.toDomain(result.hits.hits[0]._source);
    }
  }
}
```

**Query Builder Pattern:**

```typescript
export class AgencyQueryBuilder extends BaseOpenSearchQueryBuilder {
  withAgencyId(agencyId: number): AgencyQueryBuilder {
    this.mustClauses.push({
      term: { agencyId },
    });
    return this;
  }

  withVisibleAgenciesOnly(): AgencyQueryBuilder {
    this.mustClauses.push({
      term: { isHidden: false },
    });
    return this;
  }
}
```

### 4. Presentation Layer (`presentation/`)

**Purpose:** Handles HTTP requests, validation, and response formatting.

**Components:**

- **Controllers:** Handle HTTP requests and responses
- **Routes:** Define API endpoints
- **Validation:** Request validation schemas
- **Interfaces:** Request/response type definitions

**Example Structure:**

```
presentation/
├── controllers/
│   └── controller.ts
├── interfaces/
│   └── interface.ts
├── routes/
│   └── routes.ts
└── validation/
    └── validation.ts
```

**Controller Pattern:**

```typescript
export class Controller {
  static async getAgencyProfile(
    req: ValidatedRequest<
      QueryValidationRequestSchema<GetAgencyProfileRequestParams>
    >,
    res: Response,
    next: NextFunction
  ) {
    const { useCase, loggerService } = await GetAgencyProfileFactory.create(
      req
    );

    try {
      const params = req.query;
      const response = await useCase.execute(params);

      res.send({
        success: true,
        data: response,
      });
    } catch (error) {
      loggerService.errorLog({
        data: error,
        msg: "Get Agency Profile",
      });
      return next(error);
    }
  }
}
```

**Route Definition:**

```typescript
const router = Router();
const validator = createValidator({ passError: true });

router.get(
  "/agency-profile",
  validator.query(validation.getAgencyProfile),
  Controller.getAgencyProfile.bind(Controller)
);

export { router };
```

**Validation Schema:**

```typescript
const schema = {
  getAgencyProfile: Joi.object({
    id: Joi.number().required(),
    mapHeight: Joi.string(),
    mapWidth: Joi.string(),
    isBot: Joi.boolean(),
  }),
};
```

## Project Structure

### Clean Architecture Module Structure

```
src/clean-architecture/
├── shared/                          # Shared components across modules
│   ├── factories/
│   │   └── revBaseFactory.ts       # Base factory for dependency injection
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── baseRepoImpl.ts     # Base repository implementation
│   │   │   ├── baseOpenSearchQueryBuilder.ts
│   │   │   └── indexResolverImpl.ts
│   │   └── services/
│   │       └── pushMsgToUiTriggerImpl.ts
│   ├── repositories/
│   │   └── baseRepository.ts       # Repository interfaces
│   ├── services/
│   │   ├── revBaseLoggerService.ts
│   │   └── updatedTextService.ts
│   └── utils/
│       ├── currencyFormatter.ts
│       └── wordFormatter.ts
└── modules/                         # Individual business modules
    ├── find-agent/                 # Example module
    │   ├── application/
    │   │   ├── constants/
    │   │   ├── interfaces/
    │   │   └── useCases/
    │   ├── domain/
    │   │   ├── entities/
    │   │   ├── interfaces/
    │   │   └── services/
    │   ├── infrastructure/
    │   │   └── repositories/
    │   ├── mappers/                # Data transformation
    │   ├── presentation/
    │   │   ├── controllers/
    │   │   ├── interfaces/
    │   │   ├── routes/
    │   │   └── validation/
    │   ├── repositories/           # Repository interfaces
    │   └── services/              # Service interfaces
    ├── enquiries/
    ├── track-properties/
    └── [other-modules]/
```

### Legacy Module Integration

```
src/modules/                         # Legacy modules (being migrated)
├── agency/
├── findAgent/
├── listingSearchResult/
├── login/
├── p360/
├── subscriber/
└── [other-legacy-modules]/
```

## Implementation Patterns

### 1. Dependency Injection Pattern

**Factory Pattern for DI:**

```typescript
export class UseCaseFactory {
  static async create(req: any) {
    // Create base dependencies
    const revBase = RevBaseFactory.create(req);
    const indexResolver = new IndexResolverImpl();

    // Create repositories
    const repo1 = new Repo1Impl(revBase, indexResolver);
    const repo2 = new Repo2Impl(revBase, indexResolver);

    // Create services
    const service1 = new Service1Impl(revBase);

    // Create use case with all dependencies
    const useCase = new UseCase(repo1, repo2, service1);
    const loggerService = new RevBaseLoggerService(revBase);

    return { useCase, loggerService };
  }
}
```

### 2. Repository Pattern

**Repository Interface:**

```typescript
export interface EntityRepo extends BaseRepo {
  getById(id: number): Promise<Entity | void>;
  getByFilter(filter: FilterProps): Promise<{ data: Entity[]; total: number }>;
  create(entity: Entity): Promise<void>;
  update(id: number, entity: Entity): Promise<void>;
  delete(id: number): Promise<void>;
}
```

**Repository Implementation:**

```typescript
export class EntityRepoImpl extends BaseRepository implements EntityRepo {
  async getById(id: number): Promise<Entity | void> {
    const query = new EntityQueryBuilder().withId(id).build();

    const result = await this.executeQuery(query);

    if (result.hits.hits.length > 0) {
      return EntityMapper.toDomain(result.hits.hits[0]._source);
    }
  }
}
```

### 3. Mapper Pattern

**Domain Mapping:**

```typescript
export class EntityMapper {
  static toDomain(data: any): Entity {
    return Entity.create({
      id: data.id,
      name: data.name,
      // ... map other properties
    });
  }

  static toDto(entity: Entity): EntityDto {
    return {
      id: entity.getId(),
      name: entity.getName(),
      // ... map other properties
    };
  }

  static toResponse(entities: Entity[]): EntityResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
```

### 4. Query Builder Pattern

**Fluent Query Builder:**

```typescript
export class EntityQueryBuilder extends BaseOpenSearchQueryBuilder {
  withId(id: number): EntityQueryBuilder {
    this.mustClauses.push({ term: { id } });
    return this;
  }

  withStatus(status: string): EntityQueryBuilder {
    this.mustClauses.push({ term: { status } });
    return this;
  }

  withDateRange(from: Date, to: Date): EntityQueryBuilder {
    this.mustClauses.push({
      range: {
        createdAt: {
          gte: from.toISOString(),
          lte: to.toISOString(),
        },
      },
    });
    return this;
  }

  withPagination(page: number, size: number): EntityQueryBuilder {
    this.from = (page - 1) * size;
    this.size = size;
    return this;
  }

  withSorting(
    field: string,
    order: "asc" | "desc" = "desc"
  ): EntityQueryBuilder {
    this.sortClauses.push({ [field]: order });
    return this;
  }
}
```

## Module Creation Guide

### Step 1: Create Module Structure

```bash
mkdir -p src/clean-architecture/modules/your-module/{application/{useCases,constants,interfaces},domain/{entities,interfaces,services},infrastructure/repositories,presentation/{controllers,interfaces,routes,validation},repositories,services,mappers}
```

### Step 2: Define Domain Entities

```typescript
// domain/entities/yourEntity.ts
export interface YourEntityProps {
  id: number;
  name: string;
  // ... other properties
}

export class YourEntity {
  private props: YourEntityProps;

  static create(props: YourEntityProps): YourEntity {
    const entity = new YourEntity();
    entity.props = props;
    return entity;
  }

  // Business methods
  getId(): number {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  // Business logic methods
  isValid(): boolean {
    return this.props.name.length > 0;
  }
}
```

### Step 3: Define Repository Interfaces

```typescript
// repositories/yourEntityRepository.ts
export interface YourEntityRepo extends BaseRepo {
  getById(id: number): Promise<YourEntity | void>;
  getAll(): Promise<YourEntity[]>;
  create(entity: YourEntity): Promise<void>;
  update(id: number, entity: YourEntity): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### Step 4: Implement Repository

```typescript
// infrastructure/repositories/yourEntityRepoImpl.ts
export class YourEntityRepoImpl
  extends BaseRepository
  implements YourEntityRepo
{
  constructor(
    revBase: RevAppServiceMain<EConnectionTypes, ESType, CacheType>,
    private indexResolver: IndexResolverImpl
  ) {
    super(revBase);
  }

  async getById(id: number): Promise<YourEntity | void> {
    const query = new YourEntityQueryBuilder().withId(id).build();

    const result = await this.executeQuery(query);

    if (result.hits.hits.length > 0) {
      return YourEntityMapper.toDomain(result.hits.hits[0]._source);
    }
  }
}
```

### Step 5: Create Use Case

```typescript
// application/useCases/getYourEntity/getYourEntity.ts
export class GetYourEntity {
  constructor(private yourEntityRepo: YourEntityRepo) {}

  async execute(
    request: GetYourEntityRequestDto
  ): Promise<GetYourEntityResponseDto> {
    const entity = await this.yourEntityRepo.getById(request.id);

    if (!entity) {
      throw new Error("Entity not found");
    }

    return YourEntityMapper.toResponse(entity);
  }
}
```

### Step 6: Create Factory

```typescript
// application/useCases/getYourEntity/getYourEntityFactory.ts
export class GetYourEntityFactory {
  static async create(req: any) {
    const revBase = RevBaseFactory.create(req);
    const indexResolver = new IndexResolverImpl();
    const yourEntityRepo = new YourEntityRepoImpl(revBase, indexResolver);

    const useCase = new GetYourEntity(yourEntityRepo);
    const loggerService = new RevBaseLoggerService(revBase);

    return { useCase, loggerService };
  }
}
```

### Step 7: Create Controller

```typescript
// presentation/controllers/controller.ts
export class Controller {
  static async getYourEntity(
    req: ValidatedRequest<
      QueryValidationRequestSchema<GetYourEntityRequestParams>
    >,
    res: Response,
    next: NextFunction
  ) {
    const { useCase, loggerService } = await GetYourEntityFactory.create(req);

    try {
      const params = req.query;
      const response = await useCase.execute(params);

      res.send({
        success: true,
        data: response,
      });
    } catch (error) {
      loggerService.errorLog({
        data: error,
        msg: "Get Your Entity",
      });
      return next(error);
    }
  }
}
```

### Step 8: Define Routes and Validation

```typescript
// presentation/routes/routes.ts
const router = Router();
const validator = createValidator({ passError: true });

router.get(
  "/your-entity",
  validator.query(validation.getYourEntity),
  Controller.getYourEntity.bind(Controller)
);

export { router };
```

```typescript
// presentation/validation/validation.ts
const schema = {
  getYourEntity: Joi.object({
    id: Joi.number().required(),
    // ... other validation rules
  }),
};
```

### Step 9: Register Routes

```typescript
// In src/modules/index.ts
import { router as yourModuleRoutes } from "@app/clean-architecture/modules/your-module/presentation/routes/routes";

router.use("/v2/your-module/", yourModuleRoutes);
```

## Services and Routes Integration

### Traditional Module Structure (Legacy)

```
src/modules/agency/
├── agency.controller.ts
├── agency.route.ts
├── agency.service.ts
└── agency.interface.ts
```

### Clean Architecture Integration

Clean architecture modules integrate with the existing route structure:

**Public Routes (`/api/pubui/`):**

```typescript
// src/modules/index.ts
router.use("/v2/find-agent/", cleanArchFindAgent);
router.use("/v2/enquiries/", cleanArchEnquiries);
router.use("/v2/affordability-search", cleanAffordabilitySearch);
```

**Internal Routes (`/api/internal/`):**

```typescript
// src/modules/index.internal.routes.ts
router.use("/v2/find-agent/", cleanArchFindAgent);
router.use("/ai-search", listingAiSearchRoutes);
```

### Service Integration Patterns

**External Service Integration:**

```typescript
// infrastructure/services/externalApiService.ts
export class ExternalApiServiceImpl implements ExternalApiService {
  constructor(private httpClient: HttpClient) {}

  async fetchData(params: any): Promise<any> {
    const response = await this.httpClient.get("/api/endpoint", { params });
    return response.data;
  }
}
```

**Database Service Integration:**

```typescript
// infrastructure/repositories/baseRepoImpl.ts
export class BaseRepository {
  constructor(
    protected revBase: RevAppServiceMain<EConnectionTypes, ESType, CacheType>
  ) {}

  protected async executeQuery(query: any): Promise<any> {
    const esService = this.revBase.getElasticSearchService("rev");
    return await esService.search(query);
  }

  protected async executeMysqlQuery(query: string): Promise<any> {
    const dbService = this.revBase.getDbService("rev");
    return await dbService.query(query);
  }
}
```

**Cache Service Integration:**

```typescript
// infrastructure/services/cacheService.ts
export class CacheServiceImpl implements CacheService {
  constructor(
    private revBase: RevAppServiceMain<EConnectionTypes, ESType, CacheType>
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const cacheService = this.revBase.getCacheService("rev");
    return await cacheService.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const cacheService = this.revBase.getCacheService("rev");
    await cacheService.set(key, value, ttl);
  }
}
```

## Best Practices

### 1. Dependency Direction

- **Domain** should not depend on any other layer
- **Application** can depend on Domain
- **Infrastructure** can depend on Domain and Application
- **Presentation** can depend on Application (through factories)

### 2. Error Handling

```typescript
// Use case level error handling
export class UseCase {
  async execute(request: RequestDto): Promise<ResponseDto> {
    try {
      // Business logic
    } catch (error) {
      // Transform domain errors to application errors
      if (error instanceof DomainError) {
        throw new ApplicationError(error.message);
      }
      throw error;
    }
  }
}

// Controller level error handling
export class Controller {
  static async action(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await useCase.execute(request);
      res.send({ success: true, data: result });
    } catch (error) {
      loggerService.errorLog({ data: error, msg: "Action failed" });
      return next(error);
    }
  }
}
```

### 3. Validation

- **Input Validation:** At presentation layer using Joi
- **Business Rule Validation:** In domain entities and use cases
- **Data Validation:** In repository implementations

### 4. Performance Considerations

- **Caching:** Implement at repository level
- **Query Optimization:** Use query builders for efficient queries
- **Pagination:** Always implement for list endpoints
- **Lazy Loading:** Load related data only when needed

### 5. Security

- **Input Sanitization:** At presentation layer
- **Authorization:** In use cases or middleware
- **Rate Limiting:** At route level
- **SQL Injection Prevention:** Use parameterized queries

## Database Management in Clean Architecture

### Database Architecture Overview

The project uses multiple databases and search engines to handle different aspects of the application:

**Database Types:**

- **MySQL Databases:** Primary relational data storage
- **Elasticsearch:** Search and analytics
- **Redis:** Caching layer

**Database Connections:**

```typescript
// From coreLibConsumerAppService.ts
export enum EConnectionTypes {
  zenu = "zenu", // Legacy property data
  rev = "rev", // Main application database
  corelogic = "corelogic", // External property data
  revLogs = "revLogs", // Application logs
  subscriber = "subscriber", // User subscription data
}
```

### Database Configuration

**Configuration Structure:**

```json
// config/default.json
{
  "db": {
    "rev": {
      "isRequired": "@@REV_DB_REQUIRED",
      "name": "rev"
    },
    "revLogs": {
      "isRequired": true,
      "name": "revLogs"
    },
    "zenu": {
      "isRequired": false,
      "name": "zenu"
    },
    "cl": {
      "isRequired": false,
      "name": "corelogic"
    },
    "subscriber": {
      "isRequired": true,
      "name": "subscriber"
    }
  },
  "elasticsearch": {
    "rev": {
      "isRequired": true,
      "config": {
        "host": "@@REV_ES_HOST"
      },
      "name": "rev"
    },
    "zenu": {
      "isRequired": false,
      "name": "zenu"
    }
  },
  "cache": {
    "rev": {
      "isRequired": true,
      "config": {
        "readClientCount": "@@REDIS_READ_CLIENT_COUNT"
      },
      "name": "rev"
    }
  }
}
```

### Repository Pattern for Database Access

**Base Repository Implementation:**

```typescript
// shared/infrastructure/repositories/baseRepoImpl.ts
export class BaseRepository {
  constructor(
    protected revBase: RevAppServiceMain<EConnectionTypes, ESType, CacheType>
  ) {}

  // MySQL Database Operations
  protected async executeMysqlQuery(
    query: string,
    params?: any[],
    connection: EConnectionTypes = EConnectionTypes.rev
  ): Promise<any> {
    const dbService = this.revBase.getDbService(connection);
    return await dbService.query(query, params);
  }

  protected async executeMysqlTransaction(
    queries: Array<{ query: string; params?: any[] }>,
    connection: EConnectionTypes = EConnectionTypes.rev
  ): Promise<any> {
    const dbService = this.revBase.getDbService(connection);
    return await dbService.transaction(queries);
  }

  // Elasticsearch Operations
  protected async executeElasticsearchQuery(
    index: string,
    query: any,
    connection: ESType = EConnectionTypes.rev
  ): Promise<any> {
    const esService = this.revBase.getElasticSearchService(connection);
    return await esService.search({
      index,
      body: query,
    });
  }

  protected async indexDocument(
    index: string,
    id: string,
    document: any,
    connection: ESType = EConnectionTypes.rev
  ): Promise<any> {
    const esService = this.revBase.getElasticSearchService(connection);
    return await esService.index({
      index,
      id,
      body: document,
    });
  }

  protected async updateDocument(
    index: string,
    id: string,
    document: any,
    connection: ESType = EConnectionTypes.rev
  ): Promise<any> {
    const esService = this.revBase.getElasticSearchService(connection);
    return await esService.update({
      index,
      id,
      body: { doc: document },
    });
  }

  // Cache Operations
  protected async getCacheData<T>(
    key: string,
    connection: CacheType = EConnectionTypes.rev
  ): Promise<T | null> {
    const cacheService = this.revBase.getCacheService(connection);
    return await cacheService.get<T>(key);
  }

  protected async setCacheData(
    key: string,
    value: any,
    ttl?: number,
    connection: CacheType = EConnectionTypes.rev
  ): Promise<void> {
    const cacheService = this.revBase.getCacheService(connection);
    await cacheService.set(key, value, ttl);
  }

  protected async deleteCacheData(
    key: string,
    connection: CacheType = EConnectionTypes.rev
  ): Promise<void> {
    const cacheService = this.revBase.getCacheService(connection);
    await cacheService.del(key);
  }
}
```

### Database-Specific Repository Implementations

**MySQL Repository Pattern:**

```typescript
// infrastructure/repositories/agencyMysqlRepoImpl.ts
export class AgencyMysqlRepoImpl extends BaseRepository implements AgencyRepo {
  private tableName = "agencies";

  async getDetailsById(agencyId: number): Promise<AgencyDetails | void> {
    const query = `
			SELECT
				id, name, postcode, suburb_id, suburb_name, state,
				address_line1, address_line2, phone, website,
				brand_colour, logo_file_name, description
			FROM ${this.tableName}
			WHERE id = ? AND is_active = 1
		`;

    const result = await this.executeMysqlQuery(query, [agencyId]);

    if (result.length > 0) {
      return AgencyDetailMapper.fromMysqlRow(result[0]);
    }
  }

  async create(agency: AgencyDetails): Promise<void> {
    const query = `
			INSERT INTO ${this.tableName}
			(name, postcode, suburb_id, address_line1, phone, website, created_at)
			VALUES (?, ?, ?, ?, ?, ?, NOW())
		`;

    const details = agency.getDetails();
    await this.executeMysqlQuery(query, [
      details.name,
      details.postcode,
      details.suburbId,
      details.addressLine1,
      details.phone,
      details.website,
    ]);
  }

  async update(agencyId: number, agency: AgencyDetails): Promise<void> {
    const query = `
			UPDATE ${this.tableName}
			SET name = ?, postcode = ?, phone = ?, website = ?, updated_at = NOW()
			WHERE id = ?
		`;

    const details = agency.getDetails();
    await this.executeMysqlQuery(query, [
      details.name,
      details.postcode,
      details.phone,
      details.website,
      agencyId,
    ]);
  }

  async delete(agencyId: number): Promise<void> {
    const query = `
			UPDATE ${this.tableName}
			SET is_active = 0, deleted_at = NOW()
			WHERE id = ?
		`;

    await this.executeMysqlQuery(query, [agencyId]);
  }
}
```

**Elasticsearch Repository Pattern:**

```typescript
// infrastructure/repositories/agencyEsRepoImpl.ts
export class AgencyEsRepoImpl extends BaseRepository implements AgencyRepo {
  private indexName = "agencies";

  async getDetailsById(agencyId: number): Promise<AgencyDetails | void> {
    const query = new AgencyQueryBuilder()
      .withAgencyId(agencyId)
      .withActiveOnly()
      .build();

    const result = await this.executeElasticsearchQuery(this.indexName, query);

    if (result.hits.hits.length > 0) {
      return AgencyDetailMapper.fromElasticsearchHit(result.hits.hits[0]);
    }
  }

  async searchAgencies(
    searchParams: AgencySearchParams
  ): Promise<{ data: AgencyDetails[]; total: number }> {
    const query = new AgencyQueryBuilder()
      .withLocationFilter(searchParams.suburbId)
      .withPropertyTypeFilter(searchParams.propertyTypes)
      .withPagination(searchParams.page, searchParams.size)
      .withSorting(searchParams.sort)
      .build();

    const result = await this.executeElasticsearchQuery(this.indexName, query);

    const agencies = result.hits.hits.map((hit: any) =>
      AgencyDetailMapper.fromElasticsearchHit(hit)
    );

    return {
      data: agencies,
      total: result.hits.total.value,
    };
  }

  async indexAgency(agency: AgencyDetails): Promise<void> {
    const document = AgencyDetailMapper.toElasticsearchDocument(agency);
    await this.indexDocument(
      this.indexName,
      agency.getId().toString(),
      document
    );
  }

  async updateAgencyIndex(
    agencyId: number,
    agency: AgencyDetails
  ): Promise<void> {
    const document = AgencyDetailMapper.toElasticsearchDocument(agency);
    await this.updateDocument(this.indexName, agencyId.toString(), document);
  }
}
```

### Query Builder Patterns

**Base Query Builder:**

```typescript
// shared/infrastructure/repositories/baseOpenSearchQueryBuilder.ts
export class BaseOpenSearchQueryBuilder {
  protected mustClauses: any[] = [];
  protected shouldClauses: any[] = [];
  protected filterClauses: any[] = [];
  protected mustNotClauses: any[] = [];
  protected sortClauses: any[] = [];
  protected from: number = 0;
  protected size: number = 25;

  build(): any {
    const query: any = {
      query: {
        bool: {
          must: this.mustClauses,
          should: this.shouldClauses,
          filter: this.filterClauses,
          must_not: this.mustNotClauses,
        },
      },
      from: this.from,
      size: this.size,
    };

    if (this.sortClauses.length > 0) {
      query.sort = this.sortClauses;
    }

    return query;
  }

  withPagination(page: number, size: number): this {
    this.from = (page - 1) * size;
    this.size = size;
    return this;
  }

  withTermFilter(field: string, value: any): this {
    this.mustClauses.push({ term: { [field]: value } });
    return this;
  }

  withRangeFilter(field: string, gte?: any, lte?: any): this {
    const range: any = {};
    if (gte !== undefined) range.gte = gte;
    if (lte !== undefined) range.lte = lte;

    this.mustClauses.push({ range: { [field]: range } });
    return this;
  }

  withTextSearch(field: string, text: string): this {
    this.mustClauses.push({
      match: { [field]: text },
    });
    return this;
  }

  withMultiMatch(fields: string[], text: string): this {
    this.mustClauses.push({
      multi_match: {
        query: text,
        fields: fields,
      },
    });
    return this;
  }
}
```

**Specific Query Builder:**

```typescript
// infrastructure/repositories/agencyQueryBuilder.ts
export class AgencyQueryBuilder extends BaseOpenSearchQueryBuilder {
  withAgencyId(agencyId: number): AgencyQueryBuilder {
    this.mustClauses.push({ term: { agencyId } });
    return this;
  }

  withActiveOnly(): AgencyQueryBuilder {
    this.mustClauses.push({ term: { isActive: true } });
    return this;
  }

  withLocationFilter(suburbId: number): AgencyQueryBuilder {
    this.mustClauses.push({ term: { suburbId } });
    return this;
  }

  withPropertyTypeFilter(propertyTypes?: string[]): AgencyQueryBuilder {
    if (propertyTypes && propertyTypes.length > 0) {
      this.mustClauses.push({ terms: { propertyTypes } });
    }
    return this;
  }

  withPerformanceSort(sortType: EAgencySrSortTypes): AgencyQueryBuilder {
    switch (sortType) {
      case EAgencySrSortTypes.sold:
        this.sortClauses.push({ numberOfSoldListings: "desc" });
        break;
      case EAgencySrSortTypes.forSale:
        this.sortClauses.push({ numberOfBuyListings: "desc" });
        break;
      case EAgencySrSortTypes.forRent:
        this.sortClauses.push({ numberOfRentListings: "desc" });
        break;
      default:
        this.sortClauses.push({ _score: "desc" });
    }
    return this;
  }
}
```

### Transaction Management

**Database Transactions:**

```typescript
// infrastructure/repositories/agencyTransactionRepo.ts
export class AgencyTransactionRepo extends BaseRepository {
  async createAgencyWithListings(
    agency: AgencyDetails,
    listings: ListingDetails[]
  ): Promise<void> {
    const queries = [
      {
        query: `
					INSERT INTO agencies (name, postcode, suburb_id, created_at)
					VALUES (?, ?, ?, NOW())
				`,
        params: [agency.getName(), agency.getPostcode(), agency.getSuburbId()],
      },
    ];

    // Add listing queries
    listings.forEach((listing) => {
      queries.push({
        query: `
					INSERT INTO listings (agency_id, title, price, created_at)
					VALUES (LAST_INSERT_ID(), ?, ?, NOW())
				`,
        params: [listing.getTitle(), listing.getPrice()],
      });
    });

    await this.executeMysqlTransaction(queries);
  }

  async updateAgencyAndSyncElasticsearch(
    agencyId: number,
    agency: AgencyDetails
  ): Promise<void> {
    // Update MySQL
    const mysqlQuery = `
			UPDATE agencies
			SET name = ?, postcode = ?, updated_at = NOW()
			WHERE id = ?
		`;

    await this.executeMysqlQuery(mysqlQuery, [
      agency.getName(),
      agency.getPostcode(),
      agencyId,
    ]);

    // Update Elasticsearch
    const esDocument = AgencyDetailMapper.toElasticsearchDocument(agency);
    await this.updateDocument("agencies", agencyId.toString(), esDocument);

    // Clear cache
    await this.deleteCacheData(`agency:${agencyId}`);
  }
}
```

### Caching Strategies

**Repository-Level Caching:**

```typescript
// infrastructure/repositories/cachedAgencyRepoImpl.ts
export class CachedAgencyRepoImpl extends BaseRepository implements AgencyRepo {
  private cachePrefix = "agency";
  private defaultTTL = 3600; // 1 hour

  async getDetailsById(agencyId: number): Promise<AgencyDetails | void> {
    const cacheKey = `${this.cachePrefix}:${agencyId}`;

    // Try cache first
    const cachedData = await this.getCacheData<any>(cacheKey);
    if (cachedData) {
      return AgencyDetailMapper.fromCachedData(cachedData);
    }

    // Fallback to database
    const query = `
			SELECT * FROM agencies WHERE id = ? AND is_active = 1
		`;

    const result = await this.executeMysqlQuery(query, [agencyId]);

    if (result.length > 0) {
      const agency = AgencyDetailMapper.fromMysqlRow(result[0]);

      // Cache the result
      await this.setCacheData(cacheKey, result[0], this.defaultTTL);

      return agency;
    }
  }

  async update(agencyId: number, agency: AgencyDetails): Promise<void> {
    // Update database
    const query = `
			UPDATE agencies
			SET name = ?, postcode = ?, updated_at = NOW()
			WHERE id = ?
		`;

    const details = agency.getDetails();
    await this.executeMysqlQuery(query, [
      details.name,
      details.postcode,
      agencyId,
    ]);

    // Invalidate cache
    const cacheKey = `${this.cachePrefix}:${agencyId}`;
    await this.deleteCacheData(cacheKey);
  }
}
```

### Database Migration and Index Management

**Index Resolver Pattern:**

```typescript
// shared/infrastructure/repositories/indexResolverImpl.ts
export class IndexResolverImpl {
  private indexMappings: Map<string, string> = new Map([
    ["agencies", "agencies-v1"],
    ["listings", "listings-v2"],
    ["agents", "agents-v1"],
  ]);

  getIndexName(entity: string): string {
    return this.indexMappings.get(entity) || entity;
  }

  updateIndexMapping(entity: string, newIndex: string): void {
    this.indexMappings.set(entity, newIndex);
  }
}
```

**Database Connection Management:**

```typescript
// infrastructure/services/databaseConnectionService.ts
export class DatabaseConnectionService {
  constructor(
    private revBase: RevAppServiceMain<EConnectionTypes, ESType, CacheType>
  ) {}

  async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    // Test MySQL connections
    for (const connection of Object.values(EConnectionTypes)) {
      try {
        const dbService = this.revBase.getDbService(connection);
        await dbService.query("SELECT 1");
        results[`mysql_${connection}`] = true;
      } catch (error) {
        results[`mysql_${connection}`] = false;
      }
    }

    // Test Elasticsearch connections
    try {
      const esService = this.revBase.getElasticSearchService(
        EConnectionTypes.rev
      );
      await esService.ping();
      results["elasticsearch_rev"] = true;
    } catch (error) {
      results["elasticsearch_rev"] = false;
    }

    // Test Redis connections
    try {
      const cacheService = this.revBase.getCacheService(EConnectionTypes.rev);
      await cacheService.ping();
      results["redis_rev"] = true;
    } catch (error) {
      results["redis_rev"] = false;
    }

    return results;
  }

  async getConnectionHealth(): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      connections: await this.testConnections(),
    };
  }
}
```

### Best Practices for Database Management

**1. Connection Management:**

- Use connection pooling for MySQL
- Implement proper error handling for connection failures
- Monitor connection health

**2. Query Optimization:**

- Use prepared statements for security
- Implement proper indexing strategies
- Use query builders for complex queries

**3. Data Consistency:**

- Use transactions for multi-table operations
- Implement eventual consistency for cross-database operations
- Handle race conditions properly

**4. Caching Strategy:**

- Cache at repository level
- Implement cache invalidation strategies
- Use appropriate TTL values

**5. Error Handling:**

- Implement retry logic for transient failures
- Log database errors appropriately
- Provide meaningful error messages

**6. Security:**

- Use parameterized queries
- Implement proper access controls
- Encrypt sensitive data

## Examples

### Complete Module Example: Find Agent

This module demonstrates all clean architecture patterns:

**Domain Entity:**

```typescript
// domain/entities/agencyDetails.ts
export class AgencyDetails {
  private props: AgencyDetailsProps;

  static create(details: AgencyDetailsProps) {
    const agencyDetails = new AgencyDetails();
    agencyDetails.props = details;
    return agencyDetails;
  }

  isHiddenInFindAnAgent() {
    return this.props.hideInFindAnAgent;
  }

  getId() {
    return this.props.id;
  }
}
```

**Repository Interface:**

```typescript
// repositories/agencyRepository.ts
export interface AgencyRepo extends BaseRepo {
  getDetailsById(agencyId: number): Promise<AgencyDetails | void>;
  getTopPerformingSuburbsByAgency(
    agencyId: number
  ): Promise<TopPerformingSuburbByAgencyDto[]>;
}
```

**Use Case:**

```typescript
// application/useCases/getAgencyProfile/getAgencyProfile.ts
export class GetAgencyProfile {
  constructor(
    private agencyRepo: AgencyRepo,
    private agentRepo: AgentRepo,
    private listingRepo: ListingRepo,
    private staticMapImageService: StaticMapImageService
  ) {}

  async execute(
    request: GetAgencyProfileRequestDto
  ): Promise<GetAgencyProfileResponseDto> {
    const agency = await this.agencyRepo.getDetailsById(request.id);

    if (!agency || agency.isHiddenInFindAnAgent()) {
      throw new Error("Agency not found or hidden");
    }

    // Build response with business logic
    return this.buildResponse(agency, request);
  }
}
```

**Controller:**

```typescript
// presentation/controllers/controller.ts
export class Controller {
  static async getAgencyProfile(req, res, next) {
    const { useCase, loggerService } = await GetAgencyProfileFactory.create(
      req
    );

    try {
      const response = await useCase.execute(req.query);
      res.send({ success: true, data: response });
    } catch (error) {
      loggerService.errorLog({ data: error, msg: "Get Agency Profile" });
      return next(error);
    }
  }
}
```

This guide provides a comprehensive foundation for implementing clean architecture in Node.js/TypeScript projects. Use this as a reference when creating new modules or refactoring existing code to follow clean architecture principles.
