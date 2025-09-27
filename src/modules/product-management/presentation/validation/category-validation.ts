/**
 * Category Validation Schemas
 * Joi validation schemas for category endpoints
 */

import Joi from "joi";

/**
 * Create Category Validation
 */
export const createCategoryValidation = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    slug: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required()
      .messages({
        "string.pattern.base": "Slug must be in kebab-case format",
      }),
    description: Joi.string().max(1000).optional(),
    imageUrl: Joi.string().uri().optional(),
    parentId: Joi.string().uuid().optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
    seoTitle: Joi.string().max(255).optional(),
    seoDescription: Joi.string().max(500).optional(),
    seoKeywords: Joi.string().max(500).optional(),
    isActive: Joi.boolean().optional(),
  }),
});

/**
 * Get Category Validation
 */
export const getCategoryValidation = Joi.object({
  params: Joi.object({
    identifier: Joi.string().required(),
  }),
});

/**
 * Update Category Validation
 */
export const updateCategoryValidation = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    slug: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional()
      .messages({
        "string.pattern.base": "Slug must be in kebab-case format",
      }),
    description: Joi.string().max(1000).optional(),
    imageUrl: Joi.string().uri().optional(),
    parentId: Joi.string().uuid().optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
    seoTitle: Joi.string().max(255).optional(),
    seoDescription: Joi.string().max(500).optional(),
    seoKeywords: Joi.string().max(500).optional(),
    isActive: Joi.boolean().optional(),
  }),
});

/**
 * Delete Category Validation
 */
export const deleteCategoryValidation = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Get Categories Validation (with filters)
 */
export const getCategoriesValidation = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string()
      .valid("name", "sort_order", "created_at", "updated_at")
      .optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").optional(),
    parentId: Joi.string().uuid().allow(null).optional(),
    level: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().max(255).optional(),
  }),
});
