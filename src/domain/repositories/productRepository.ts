import { ProductStatus } from "../enum/productStatus";
import { ProductVisibility } from "../enum/productVisibility";

export type TProductRecord = {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  weight: number | null;
  dimensions: any | null; // JSONB
  images: any | null; // JSONB array
  video_url: string | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  password: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  tags: any | null; // JSONB array
  attributes: any | null; // JSONB object
  view_count: number;
  favorite_count: number;
  average_rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
