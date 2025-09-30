export class AddToCartResponseDto {
  public readonly success: boolean;
  public readonly message: string;
  public readonly cartItemId: string;
  public readonly productId: string;
  public readonly quantity: number;
  public readonly addedAt: Date;

  constructor(data: {
    success: boolean;
    message: string;
    cartItemId: string;
    productId: string;
    quantity: number;
  }) {
    this.success = data.success;
    this.message = data.message;
    this.cartItemId = data.cartItemId;
    this.productId = data.productId;
    this.quantity = data.quantity;
    this.addedAt = new Date();
  }

  static success(
    cartItemId: string,
    productId: string,
    quantity: number
  ): AddToCartResponseDto {
    return new AddToCartResponseDto({
      success: true,
      message: "Product added to cart successfully",
      cartItemId,
      productId,
      quantity,
    });
  }
}
