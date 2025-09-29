import { Category } from "../../../entities/catalog/category";
import { Product } from "../../../entities/catalog/product";

export interface HomepageData {
  categories: Category[];
  featuredProducts: Product[];
}

export interface IGetHomepageDataUseCase {
  execute(): Promise<HomepageData>;
}
