/**
 * Get Product Use Case
 * Business logic for retrieving a product
 */

import { ProductEntity } from "../../../domain/entities/product-entity";
import { IProductRepository } from "../../../domain/interfaces/product-domain-interfaces";
import { GetProductRequestDto } from "./get-product-request-dto";
import { GetProductResponseDto } from "./get-product-response-dto";

export interface IGetProductUseCase {
  execute(request: GetProductRequestDto): Promise<GetProductResponseDto>;
}

export class GetProductUseCase implements IGetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(request: GetProductRequestDto): Promise<GetProductResponseDto> {
    // Find product by ID or slug
    let product: ProductEntity | null = null;

    if (request.productId) {
      product = await this.productRepository.findById(request.productId);
    } else if (request.slug) {
      product = await this.productRepository.findBySlug(request.slug);
    }

    if (!product) {
      throw new Error("Product not found");
    }

    // Increment view count if requested
    if (request.incrementViewCount) {
      await this.productRepository.incrementViewCount(product.id);
      // Update the product entity with new view count
      product = product.update({ viewCount: product.viewCount + 1 });
    }

    // Return response DTO
    return this.mapToResponseDto(product);
  }

  private mapToResponseDto(product: ProductEntity): GetProductResponseDto {
    return new GetProductResponseDto({
      id: product.id,
      sellerId: product.sellerId,
      categoryId: product.categoryId || null,
      name: product.name,
      slug: product.slug,
      description: product.description || null,
      shortDescription: product.shortDescription || null,
      price: product.price,
      comparePrice: product.comparePrice || null,
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
      isAvailable: product.isAvailable(),
      isOnSale: product.isOnSale(),
      discountPercentage: product.getDiscountPercentage(),
      mainImage: product.getMainImage() || null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  }
}
