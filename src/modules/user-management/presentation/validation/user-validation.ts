import Joi from "joi";
import { USER_CONSTANTS } from "../../application/constants/user-constants";

export const userValidationSchemas = {
  registerUser: Joi.object({
    email: Joi.string()
      .email()
      .max(USER_CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH)
      .required()
      .messages({
        "string.email": "Please provide a valid email address",
        "string.max": `Email must be less than ${USER_CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH} characters`,
        "any.required": "Email is required",
      }),

    password: Joi.string()
      .min(USER_CONSTANTS.PASSWORD.MIN_LENGTH)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      )
      .required()
      .messages({
        "string.min": `Password must be at least ${USER_CONSTANTS.PASSWORD.MIN_LENGTH} characters long`,
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),

    firstName: Joi.string()
      .min(USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH)
      .max(USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .required()
      .messages({
        "string.min": `First name must be at least ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`,
        "string.max": `First name must be less than ${USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`,
        "any.required": "First name is required",
      }),

    lastName: Joi.string()
      .min(USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH)
      .max(USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .required()
      .messages({
        "string.min": `Last name must be at least ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`,
        "string.max": `Last name must be less than ${USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`,
        "any.required": "Last name is required",
      }),

    role: Joi.string()
      .valid(...Object.values(USER_CONSTANTS.ROLES))
      .optional()
      .messages({
        "any.only": `Role must be one of: ${Object.values(
          USER_CONSTANTS.ROLES
        ).join(", ")}`,
      }),

    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .min(USER_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH)
      .max(USER_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH)
      .optional()
      .messages({
        "string.pattern.base": "Please provide a valid phone number",
        "string.min": `Phone number must be at least ${USER_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH} digits`,
        "string.max": `Phone number must be less than ${USER_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH} digits`,
      }),
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),

    rememberMe: Joi.boolean().optional().default(false),
  }),

  updateUserProfile: Joi.object({
    firstName: Joi.string()
      .min(USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH)
      .max(USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .optional()
      .messages({
        "string.min": `First name must be at least ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`,
        "string.max": `First name must be less than ${USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`,
      }),

    lastName: Joi.string()
      .min(USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH)
      .max(USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .optional()
      .messages({
        "string.min": `Last name must be at least ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`,
        "string.max": `Last name must be less than ${USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`,
      }),

    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .min(USER_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH)
      .max(USER_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Please provide a valid phone number",
        "string.min": `Phone number must be at least ${USER_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH} digits`,
        "string.max": `Phone number must be less than ${USER_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH} digits`,
      }),
  }),

  emailVerificationToken: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Verification token is required",
    }),
  }),

  requestPasswordReset: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),

    password: Joi.string()
      .min(USER_CONSTANTS.PASSWORD.MIN_LENGTH)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      )
      .required()
      .messages({
        "string.min": `Password must be at least ${USER_CONSTANTS.PASSWORD.MIN_LENGTH} characters long`,
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
  }),

  // Query parameters validation
  getUsersQuery: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(USER_CONSTANTS.PAGINATION.DEFAULT_PAGE)
      .optional(),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(USER_CONSTANTS.PAGINATION.MAX_LIMIT)
      .default(USER_CONSTANTS.PAGINATION.DEFAULT_LIMIT)
      .optional(),

    role: Joi.string()
      .valid(...Object.values(USER_CONSTANTS.ROLES))
      .optional(),

    status: Joi.string()
      .valid(...Object.values(USER_CONSTANTS.STATUS))
      .optional(),

    email: Joi.string().email().optional(),

    firstName: Joi.string().optional(),

    lastName: Joi.string().optional(),
  }),
};
