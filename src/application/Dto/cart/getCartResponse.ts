export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  addedAt: Date;
}

export class GetCartResponseDto {
  public readonly userId: string;
  public readonly items: CartItemDto[];
  public readonly totalItems: number;
  public readonly totalAmount: number;
  public readonly updatedAt: Date;

  constructor(data: { userId: string; items: CartItemDto[] }) {
    this.userId = data.userId;
    this.items = data.items;
    this.totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = data.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    this.updatedAt = new Date();
  }

  static fromData(userId: string, items: CartItemDto[]): GetCartResponseDto {
    return new GetCartResponseDto({ userId, items });
  }
}
