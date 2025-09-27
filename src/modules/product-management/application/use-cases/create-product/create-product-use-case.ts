/**
 * Create Product Use Case
 * Business logic for creating a new product
 */

import {
  ProductEntity,
  ProductStatus,
  ProductVisibility,
} from "../../../domain/entities/product-entity";
import {
  IProductRepository,
  ICategoryRepository,
} from "../../../domain/interfaces/product-domain-interfaces";
import { CreateProductRequestDto } from "./create-product-request-dto";
import { CreateProductResponseDto } from "./create-product-response-dto";

export interface ICreateProductUseCase {
  execute(request: CreateProductRequestDto): Promise<CreateProductResponseDto>;
}

export class CreateProductUseCase implements ICreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(
    request: CreateProductRequestDto
  ): Promise<CreateProductResponseDto> {
    // Validate business rules
    await this.validateBusinessRules(request);

    // Create product data
    const productData = {
      sellerId: request.sellerId,
      categoryId: request.categoryId,
      name: request.name,
      slug: request.slug,
      description: request.description,
      shortDescription: request.shortDescription,
      price: request.price,
      comparePrice: request.comparePrice,
      costPrice: request.costPrice,
      sku: request.sku,
      stockQuantity: request.stockQuantity || 0,
      lowStockThreshold: request.lowStockThreshold || 10,
      trackInventory: request.trackInventory ?? true,
      allowBackorders: request.allowBackorders ?? false,
      weight: request.weight,
      dimensions: request.dimensions,
      images: request.images || [],
      videoUrl: request.videoUrl,
      status: request.status || ProductStatus.DRAFT,
      visibility: request.visibility || ProductVisibility.PUBLIC,
      password: request.password,
      seoTitle: request.seoTitle,
      seoDescription: request.seoDescription,
      seoKeywords: request.seoKeywords,
      tags: request.tags || [],
      attributes: request.attributes || {},
    };

    // Create product
    const product = await this.productRepository.create(productData);

    // Return response DTO
    return this.mapToResponseDto(product);
  }

  private async validateBusinessRules(
    request: CreateProductRequestDto
  ): Promise<void> {
    // Check if slug already exists
    const existingProduct = await this.productRepository.findBySlug(
      request.slug
    );
    if (existingProduct) {
      throw new Error(`Product with slug '${request.slug}' already exists`);
    }

    // Check if SKU already exists (if provided)
    if (request.sku) {
      const existingProductBySku = await this.productRepository.findBySku(
        request.sku
      );
      if (existingProductBySku) {
        throw new Error(`Product with SKU '${request.sku}' already exists`);
      }
    }

    // Validate category exists if provided
    if (request.categoryId) {
      const category = await this.categoryRepository.findById(
        request.categoryId
      );
      if (!category) {
        throw new Error(`Category with id '${request.categoryId}' not found`);
      }

      if (!category.isActive) {
        throw new Error("Cannot assign product to inactive category");
      }
    }

    // Validate compare price is higher than price
    if (request.comparePrice && request.comparePrice <= request.price) {
      throw new Error("Compare price must be higher than regular price");
    }

    // Validate cost price is lower than price (business rule)
    if (request.costPrice && request.costPrice >= request.price) {
      throw new Error("Cost price should be lower than selling price");
    }
  }

  private mapToResponseDto(product: ProductEntity): CreateProductResponseDto {
    return new CreateProductResponseDto({
      id: product.id,
      sellerId: product.sellerId,
      categoryId: product.categoryId || null,
      name: product.name,
      slug: product.slug,
      description: product.description || null,
      shortDescription: product.shortDescription || null,
      price: product.price,
      comparePrice: product.comparePrice || null,
      costPrice: product.costPrice || null,
      sku: product.sku || null,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      trackInventory: product.trackInventory,
      allowBackorders: product.allowBackorders,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      images: product.images,
      videoUrl: product.videoUrl || null,
      status: product.status,
      visibility: product.visibility,
      seoTitle: product.seoTitle || null,
      seoDescription: product.seoDescription || null,
      seoKeywords: product.seoKeywords || null,
      tags: product.tags,
      attributes: product.attributes,
      viewCount: product.viewCount,
      favoriteCount: product.favoriteCount,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  }
}
