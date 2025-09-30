import { ICartRepository } from "../../../infrastructure/repositories/cartRepoImpl";
import { GetCartRequestDto } from "../../Dto/cart/getCartRequest";
import {
  GetCartResponseDto,
  CartItemDto,
} from "../../Dto/cart/getCartResponse";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";

export class GetCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(params: GetCartRequestDto): Promise<GetCartResponseDto> {
    try {
      this.logger.info("Get cart initiated", {
        userId: params.userId,
      });

      // Get cart items from database
      const cartItems = await this.cartRepository.getCartItems(params.userId);

      // Convert to DTO format
      const cartItemDtos: CartItemDto[] = cartItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        addedAt: item.addedAt,
      }));

      this.logger.info("Cart retrieved successfully", {
        userId: params.userId,
        itemCount: cartItemDtos.length,
        totalAmount: cartItemDtos.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        ),
      });

      return GetCartResponseDto.fromData(params.userId, cartItemDtos);
    } catch (error: any) {
      this.logger.error("Get cart failed", {
        userId: params.userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
