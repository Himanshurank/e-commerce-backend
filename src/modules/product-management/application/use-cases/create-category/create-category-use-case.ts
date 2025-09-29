/**
 * Create Category Use Case
 * Business logic for creating a new category
 */

import { CategoryEntity } from "../../../domain/entities/category-entity";
import { ICategoryRepository } from "../../../domain/interfaces/product-domain-interfaces";
import { CreateCategoryRequestDto } from "./create-category-request-dto";
import { CreateCategoryResponseDto } from "./create-category-response-dto";
import { ILoggerService } from "../../../../../shared/interfaces/logger-service-interface";

export interface ICreateCategoryUseCase {
  execute(
    request: CreateCategoryRequestDto
  ): Promise<CreateCategoryResponseDto>;
}

export class CreateCategoryUseCase implements ICreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly logger?: ILoggerService
  ) {}

  async execute(
    request: CreateCategoryRequestDto
  ): Promise<CreateCategoryResponseDto> {
    // Validate business rules
    await this.validateBusinessRules(request);

    // Create category data
    const categoryData = {
      name: request.name,
      slug: request.slug,
      description: request.description,
      imageUrl: request.imageUrl,
      parentId: request.parentId,
      sortOrder: request.sortOrder || 0,
      seoTitle: request.seoTitle,
      seoDescription: request.seoDescription,
      seoKeywords: request.seoKeywords,
      isActive: request.isActive ?? true,
    };

    // Create category
    const category = await this.categoryRepository.create(categoryData);

    // Return response DTO
    return this.mapToResponseDto(category);
  }

  private async validateBusinessRules(
    request: CreateCategoryRequestDto
  ): Promise<void> {
    // Check if slug already exists
    const existingCategory = await this.categoryRepository.findBySlug(
      request.slug
    );
    if (existingCategory) {
      throw new Error(`Category with slug '${request.slug}' already exists`);
    }

    // Validate parent category exists if provided
    if (request.parentId) {
      const parentCategory = await this.categoryRepository.findById(
        request.parentId
      );
      if (!parentCategory) {
        throw new Error(
          `Parent category with id '${request.parentId}' not found`
        );
      }

      // Prevent deep nesting (max 5 levels)
      if (parentCategory.level >= 4) {
        throw new Error("Category nesting cannot exceed 5 levels");
      }
    }
  }

  private mapToResponseDto(
    category: CategoryEntity
  ): CreateCategoryResponseDto {
    return new CreateCategoryResponseDto({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      imageUrl: category.imageUrl || null,
      parentId: category.parentId || null,
      level: category.level,
      sortOrder: category.sortOrder,
      seoTitle: category.seoTitle || null,
      seoDescription: category.seoDescription || null,
      seoKeywords: category.seoKeywords || null,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  }
}
