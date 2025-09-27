/**
 * Get Product Request DTO
 * Data Transfer Object for getting a product
 */

export interface IGetProductRequestDto {
  productId: string | undefined;
  slug: string | undefined;
  incrementViewCount: boolean | undefined;
}

export class GetProductRequestDto implements IGetProductRequestDto {
  public readonly productId: string | undefined;
  public readonly slug: string | undefined;
  public readonly incrementViewCount: boolean;

  constructor(data: IGetProductRequestDto) {
    this.productId = data.productId;
    this.slug = data.slug;
    this.incrementViewCount = data.incrementViewCount ?? false;

    this.validate();
  }

  private validate(): void {
    if (!this.productId && !this.slug) {
      throw new Error("Either product ID or slug must be provided");
    }

    if (this.productId && this.slug) {
      throw new Error("Provide either product ID or slug, not both");
    }
  }
}
