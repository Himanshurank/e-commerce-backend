import { Request, Response } from "express";

export interface ICartController {
  addToCart(req: Request, res: Response): Promise<void>;
  getCart(req: Request, res: Response): Promise<void>;
}
