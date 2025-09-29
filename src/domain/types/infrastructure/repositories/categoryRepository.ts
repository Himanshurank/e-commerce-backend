export type TCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  level: number;
  sort_order: number;
  path: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};
