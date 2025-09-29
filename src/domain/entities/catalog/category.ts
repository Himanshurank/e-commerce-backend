import { TCategoryRecord } from "../../types/infrastructure/repositories/categoryRepository";

interface Props {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
  path: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _slug: string;
  private readonly _description: string | null;
  private readonly _imageUrl: string | null;
  private readonly _parentId: string | null;
  private readonly _level: number;
  private readonly _sortOrder: number;
  private readonly _path: string | null;
  private readonly _seoTitle: string | null;
  private readonly _seoDescription: string | null;
  private readonly _seoKeywords: string | null;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor({
    id,
    name,
    slug,
    description,
    imageUrl,
    parentId,
    level,
    sortOrder,
    path,
    seoTitle,
    seoDescription,
    seoKeywords,
    isActive,
    createdAt,
    updatedAt,
  }: Props) {
    this._id = id;
    this._name = name;
    this._slug = slug;
    this._description = description;
    this._imageUrl = imageUrl;
    this._parentId = parentId;
    this._level = level;
    this._sortOrder = sortOrder;
    this._path = path;
    this._seoTitle = seoTitle;
    this._seoDescription = seoDescription;
    this._seoKeywords = seoKeywords;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;

    this.validate();
  }

  // Static factory for database records
  static create(params: TCategoryRecord): Category {
    return new Category({
      id: params.id,
      name: params.name,
      slug: params.slug,
      description: params.description,
      imageUrl: params.image_url,
      parentId: params.parent_id,
      level: params.level,
      sortOrder: params.sort_order,
      path: params.path,
      seoTitle: params.seo_title,
      seoDescription: params.seo_description,
      seoKeywords: params.seo_keywords,
      isActive: params.is_active,
      createdAt: params.created_at,
      updatedAt: params.updated_at,
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get slug(): string {
    return this._slug;
  }
  get description(): string | null {
    return this._description;
  }
  get imageUrl(): string | null {
    return this._imageUrl;
  }
  get parentId(): string | null {
    return this._parentId;
  }
  get level(): number {
    return this._level;
  }
  get sortOrder(): number {
    return this._sortOrder;
  }
  get path(): string | null {
    return this._path;
  }
  get seoTitle(): string | null {
    return this._seoTitle;
  }
  get seoDescription(): string | null {
    return this._seoDescription;
  }
  get seoKeywords(): string | null {
    return this._seoKeywords;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  public isRootCategory(): boolean {
    return this._parentId === null;
  }

  public hasChildren(): boolean {
    return this._level >= 0; // Categories can have children if they exist
  }

  public isVisible(): boolean {
    return this._isActive;
  }

  private validate(): void {
    if (!this._id || this._id.trim() === "") {
      throw new Error("Category ID is required");
    }

    if (!this._name || this._name.trim() === "") {
      throw new Error("Category name is required");
    }

    if (!this._slug || this._slug.trim() === "") {
      throw new Error("Category slug is required");
    }

    if (this._level < 0) {
      throw new Error("Category level must be non-negative");
    }

    if (this._sortOrder < 0) {
      throw new Error("Category sort order must be non-negative");
    }
  }
}
