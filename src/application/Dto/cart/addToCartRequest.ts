export class AddToCartRequestDto {
  public readonly userId: string;
  public readonly productId: string;
  public readonly quantity: number;

  constructor(data: { userId: string; productId: string; quantity: number }) {
    this.userId = data.userId;
    this.productId = data.productId;
    this.quantity = data.quantity;
    this.validate();
  }

  static fromRequest(body: any, userId: string): AddToCartRequestDto {
    return new AddToCartRequestDto({
      userId,
      productId: body.productId,
      quantity: body.quantity,
    });
  }

  private validate(): void {
    if (!this.userId || this.userId.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!this.productId || this.productId.trim() === "") {
      throw new Error("Product ID is required");
    }

    if (!this.quantity || this.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
  }
}
