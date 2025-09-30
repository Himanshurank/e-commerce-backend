import { CartController } from "../controllers/cartController";
import { AddToCartUseCase } from "../../application/usecases/cart/addToCartUseCase";
import { GetCartUseCase } from "../../application/usecases/cart/getCartUseCase";
import { CartRepoImpl } from "../../infrastructure/repositories/cartRepoImpl";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";

export class CartControllerFactory {
  static create(
    databaseService: IDatabaseService,
    logger: ILoggerService
  ): CartController {
    // Create repository
    const cartRepository = new CartRepoImpl(databaseService, logger);

    // Create use cases
    const addToCartUseCase = new AddToCartUseCase(cartRepository, logger);
    const getCartUseCase = new GetCartUseCase(cartRepository, logger);

    // Create and return controller
    return new CartController(addToCartUseCase, getCartUseCase, logger);
  }
}
