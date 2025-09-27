/**
 * Product Validation Schemas
 * Joi validation schemas for product endpoints
 */

import Joi from "joi";
import {
  ProductStatus,
  ProductVisibility,
} from "../../domain/entities/product-entity";

// Product image validation schema
const productImageSchema = Joi.object({
  id: Joi.string().required(),
  url: Joi.string().uri().required(),
  alt: Joi.string().optional(),
  sortOrder: Joi.number().integer().min(0).required(),
  isMain: Joi.boolean().required(),
});

// Product dimensions validation schema
const productDimensionsSchema = Joi.object({
  length: Joi.number().positive().optional(),
  width: Joi.number().positive().optional(),
  height: Joi.number().positive().optional(),
  unit: Joi.string().valid("cm", "inch").optional(),
});

/**
 * Create Product Validation
 */
export const createProductValidation = Joi.object({
  body: Joi.object({
    categoryId: Joi.string().uuid().optional(),
    name: Joi.string().min(1).max(255).required(),
    slug: Joi.string()
      .min(1)
      .max(255)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required()
      .messages({
        "string.pattern.base": "Slug must be in kebab-case format",
      }),
    description: Joi.string().max(5000).optional(),
    shortDescription: Joi.string().max(500).optional(),
    price: Joi.number().positive().precision(2).required(),
    comparePrice: Joi.number().positive().precision(2).optional(),
    costPrice: Joi.number().positive().precision(2).optional(),
    sku: Joi.string().max(100).optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    lowStockThreshold: Joi.number().integer().min(0).optional(),
    trackInventory: Joi.boolean().optional(),
    allowBackorders: Joi.boolean().optional(),
    weight: Joi.number().positive().precision(2).optional(),
    dimensions: productDimensionsSchema.optional(),
    images: Joi.array().items(productImageSchema).max(5).optional(),
    videoUrl: Joi.string().uri().optional(),
    status: Joi.string()
      .valid(...Object.values(ProductStatus))
      .optional(),
    visibility: Joi.string()
      .valid(...Object.values(ProductVisibility))
      .optional(),
    password: Joi.string().min(6).optional(),
    seoTitle: Joi.string().max(255).optional(),
    seoDescription: Joi.string().max(500).optional(),
    seoKeywords: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    attributes: Joi.object().optional(),
  }),
});

/**
 * Get Product Validation
 */
export const getProductValidation = Joi.object({
  params: Joi.object({
    identifier: Joi.string().required(),
  }),
  query: Joi.object({
    increment_view: Joi.string().valid("true", "false").optional(),
  }),
});

/**
 * Update Product Validation
 */
export const updateProductValidation = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    categoryId: Joi.string().uuid().optional(),
    name: Joi.string().min(1).max(255).optional(),
    slug: Joi.string()
      .min(1)
      .max(255)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional()
      .messages({
        "string.pattern.base": "Slug must be in kebab-case format",
      }),
    description: Joi.string().max(5000).optional(),
    shortDescription: Joi.string().max(500).optional(),
    price: Joi.number().positive().precision(2).optional(),
    comparePrice: Joi.number().positive().precision(2).optional(),
    costPrice: Joi.number().positive().precision(2).optional(),
    sku: Joi.string().max(100).optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    lowStockThreshold: Joi.number().integer().min(0).optional(),
    trackInventory: Joi.boolean().optional(),
    allowBackorders: Joi.boolean().optional(),
    weight: Joi.number().positive().precision(2).optional(),
    dimensions: productDimensionsSchema.optional(),
    images: Joi.array().items(productImageSchema).max(5).optional(),
    videoUrl: Joi.string().uri().optional(),
    status: Joi.string()
      .valid(...Object.values(ProductStatus))
      .optional(),
    visibility: Joi.string()
      .valid(...Object.values(ProductVisibility))
      .optional(),
    password: Joi.string().min(6).optional(),
    seoTitle: Joi.string().max(255).optional(),
    seoDescription: Joi.string().max(500).optional(),
    seoKeywords: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    attributes: Joi.object().optional(),
  }),
});

/**
 * Delete Product Validation
 */
export const deleteProductValidation = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Get Products Validation (with filters)
 */
export const getProductsValidation = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string()
      .valid("name", "price", "created_at", "updated_at", "average_rating")
      .optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").optional(),
    sellerId: Joi.string().uuid().optional(),
    categoryId: Joi.string().uuid().optional(),
    status: Joi.string()
      .valid(...Object.values(ProductStatus))
      .optional(),
    minPrice: Joi.number().positive().precision(2).optional(),
    maxPrice: Joi.number().positive().precision(2).optional(),
    inStock: Joi.boolean().optional(),
    search: Joi.string().max(255).optional(),
    tags: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
  }),
});
