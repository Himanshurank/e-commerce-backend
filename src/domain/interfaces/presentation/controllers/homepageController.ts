import { Request, Response } from "express";

export interface IHomepageController {
  getHomepageData(req: Request, res: Response): Promise<void>;
}
