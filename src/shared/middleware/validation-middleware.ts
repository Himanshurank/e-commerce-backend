import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];

    // Validate request body
    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
          });
        });
      }
    }

    // Validate request parameters
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: `params.${detail.path.join(".")}`,
            message: detail.message,
            value: detail.context?.value,
          });
        });
      }
    }

    // Validate query parameters
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: `query.${detail.path.join(".")}`,
            message: detail.message,
            value: detail.context?.value,
          });
        });
      } else {
        // Update req.query with validated and transformed values
        req.query = value;
      }
    }

    // Validate request headers
    if (schemas.headers) {
      const { error } = schemas.headers.validate(req.headers, {
        abortEarly: false,
        allowUnknown: true, // Allow unknown headers
        stripUnknown: false,
      });

      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: `headers.${detail.path.join(".")}`,
            message: detail.message,
            value: detail.context?.value,
          });
        });
      }
    }

    // If there are validation errors, return 400 Bad Request
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: errors,
        },
      });
    }

    // Continue to next middleware if validation passes
    return next();
  };
};

// Middleware to validate specific field types
export const validateId = (paramName: string = "id") => {
  const schema = Joi.object({
    [paramName]: Joi.string()
      .uuid()
      .required()
      .messages({
        "string.guid": `${paramName} must be a valid UUID`,
        "any.required": `${paramName} is required`,
      }),
  });

  return validateRequest({ params: schema });
};

export const validatePagination = () => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(25),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  });

  return validateRequest({ query: schema });
};

// Custom validation error class
export class ValidationErrorClass extends Error {
  public errors: ValidationError[];
  public statusCode: number;

  constructor(errors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
    this.statusCode = 400;
  }
}
