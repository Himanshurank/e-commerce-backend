import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { randomUUID } from "crypto";

export interface ICartRepository {
  // Find or create user's cart
  findOrCreateCartByUserId(
    userId: string
  ): Promise<{ id: string; userId: string }>;

  // Cart item operations
  addCartItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPrice: number
  ): Promise<{
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<void>;

  getCartItems(userId: string): Promise<
    Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      totalPrice: number;
      addedAt: Date;
    }>
  >;

  removeCartItem(cartItemId: string): Promise<void>;

  clearCart(cartId: string): Promise<void>;
}

export class CartRepoImpl implements ICartRepository {
  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async findOrCreateCartByUserId(
    userId: string
  ): Promise<{ id: string; userId: string }> {
    try {
      // First, try to find existing active cart
      const findCartQuery = `
        SELECT id, user_id
        FROM carts
        WHERE user_id = $1 AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const existingCart = await this.databaseService.select<{
        id: string;
        user_id: string;
      }>(findCartQuery, [userId], "findCartByUserId");

      if (existingCart.length > 0) {
        const cart = existingCart[0];
        if (!cart) {
          throw new Error("Cart data is invalid");
        }
        return {
          id: cart.id,
          userId: cart.user_id,
        };
      }

      // Create new cart if none exists
      const cartId = randomUUID();
      const createCartQuery = `
        INSERT INTO carts (id, user_id, status, created_at, updated_at)
        VALUES ($1, $2, 'active', NOW(), NOW())
        RETURNING id, user_id
      `;

      const newCart = await this.databaseService.select<{
        id: string;
        user_id: string;
      }>(createCartQuery, [cartId, userId], "createCart");

      const cart = newCart[0];
      if (!cart) {
        throw new Error("Failed to create cart");
      }
      return {
        id: cart.id,
        userId: cart.user_id,
      };
    } catch (error: any) {
      this.logger.error("Failed to find or create cart", {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async addCartItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPrice: number
  ): Promise<{
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> {
    try {
      const cartItemId = randomUUID();
      const totalPrice = unitPrice * quantity;

      // Check if item already exists in cart
      const existingItemQuery = `
        SELECT id, quantity
        FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
      `;

      const existingItems = await this.databaseService.select<{
        id: string;
        quantity: number;
      }>(existingItemQuery, [cartId, productId], "findExistingCartItem");

      if (existingItems.length > 0) {
        // Update existing item quantity
        const existingItem = existingItems[0];
        if (!existingItem) {
          throw new Error("Existing cart item data is invalid");
        }
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = unitPrice * newQuantity;

        const updateQuery = `
          UPDATE cart_items
          SET quantity = $1, total_price = $2, updated_at = NOW()
          WHERE id = $3
          RETURNING id, cart_id, product_id, quantity, unit_price, total_price
        `;

        const updatedItem = await this.databaseService.select<{
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        }>(
          updateQuery,
          [newQuantity, newTotalPrice, existingItem.id],
          "updateCartItem"
        );

        const item = updatedItem[0];
        if (!item) {
          throw new Error("Failed to update cart item");
        }
        return {
          id: item.id,
          cartId: item.cart_id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        };
      } else {
        // Insert new cart item
        const insertQuery = `
          INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, total_price, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id, cart_id, product_id, quantity, unit_price, total_price
        `;

        const newItem = await this.databaseService.select<{
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        }>(
          insertQuery,
          [cartItemId, cartId, productId, quantity, unitPrice, totalPrice],
          "addCartItem"
        );

        const item = newItem[0];
        if (!item) {
          throw new Error("Failed to create cart item");
        }
        return {
          id: item.id,
          cartId: item.cart_id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        };
      }
    } catch (error: any) {
      this.logger.error("Failed to add cart item", {
        cartId,
        productId,
        quantity,
        unitPrice,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    try {
      const query = `
        UPDATE cart_items
        SET quantity = $1, total_price = unit_price * $1, updated_at = NOW()
        WHERE cart_id = $2 AND product_id = $3
      `;

      await this.databaseService.update(
        query,
        [quantity, cartId, productId],
        "updateCartItemQuantity"
      );
    } catch (error: any) {
      this.logger.error("Failed to update cart item quantity", {
        cartId,
        productId,
        quantity,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getCartItems(userId: string): Promise<
    Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      totalPrice: number;
      addedAt: Date;
    }>
  > {
    try {
      const query = `
        SELECT
          ci.id,
          ci.product_id,
          p.name as product_name,
          ci.quantity,
          ci.unit_price as price,
          ci.total_price,
          ci.created_at as added_at
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = $1 AND c.status = 'active'
        ORDER BY ci.created_at DESC
      `;

      const items = await this.databaseService.select<{
        id: string;
        product_id: string;
        product_name: string;
        quantity: number;
        price: number;
        total_price: number;
        added_at: Date;
      }>(query, [userId], "getCartItems");

      return items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.total_price,
        addedAt: item.added_at,
      }));
    } catch (error: any) {
      this.logger.error("Failed to get cart items", {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async removeCartItem(cartItemId: string): Promise<void> {
    try {
      const query = `DELETE FROM cart_items WHERE id = $1`;
      await this.databaseService.delete(query, [cartItemId], "removeCartItem");
    } catch (error: any) {
      this.logger.error("Failed to remove cart item", {
        cartItemId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async clearCart(cartId: string): Promise<void> {
    try {
      const query = `DELETE FROM cart_items WHERE cart_id = $1`;
      await this.databaseService.delete(query, [cartId], "clearCart");
    } catch (error: any) {
      this.logger.error("Failed to clear cart", {
        cartId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
