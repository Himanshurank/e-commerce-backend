import { ICartRepository } from "../../../infrastructure/repositories/cartRepoImpl";
import { AddToCartRequestDto } from "../../Dto/cart/addToCartRequest";
import { AddToCartResponseDto } from "../../Dto/cart/addToCartResponse";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";

export class AddToCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(params: AddToCartRequestDto): Promise<AddToCartResponseDto> {
    try {
      this.logger.info("Add to cart initiated", {
        userId: params.userId,
        productId: params.productId,
        quantity: params.quantity,
      });

      // Find or create user's cart
      const cart = await this.cartRepository.findOrCreateCartByUserId(
        params.userId
      );

      // For now, using a default price of 99.99 - in real implementation,
      // you would fetch the actual product price from products table
      const defaultPrice = 99.99;

      // Add item to cart
      const cartItem = await this.cartRepository.addCartItem(
        cart.id,
        params.productId,
        params.quantity,
        defaultPrice
      );

      this.logger.info("Product added to cart successfully", {
        userId: params.userId,
        productId: params.productId,
        quantity: params.quantity,
        cartItemId: cartItem.id,
        cartId: cart.id,
      });

      return AddToCartResponseDto.success(
        cartItem.id,
        params.productId,
        params.quantity
      );
    } catch (error: any) {
      this.logger.error("Add to cart failed", {
        userId: params.userId,
        productId: params.productId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
