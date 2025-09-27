export const USER_CONSTANTS = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
    SALT_ROUNDS: 12,
  },

  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRY: '24h',
    REFRESH_TOKEN_EXPIRY: '7d',
    EMAIL_VERIFICATION_EXPIRY: '24h',
    PASSWORD_RESET_EXPIRY: '1h',
  },

  // User validation
  VALIDATION: {
    EMAIL_MAX_LENGTH: 255,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
  },

  // User roles
  ROLES: {
    CUSTOMER: 'CUSTOMER',
    SELLER: 'SELLER',
    ADMIN: 'ADMIN',
  },

  // User status
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
  },

  // Seller profile validation
  SELLER_PROFILE: {
    BUSINESS_NAME_MIN_LENGTH: 2,
    BUSINESS_NAME_MAX_LENGTH: 100,
    BUSINESS_DESCRIPTION_MAX_LENGTH: 1000,
    DEFAULT_COMMISSION_RATE: 5.0,
    MIN_COMMISSION_RATE: 0,
    MAX_COMMISSION_RATE: 100,
  },

  // Error messages
  ERRORS: {
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Email not verified',
    ACCOUNT_SUSPENDED: 'Account has been suspended',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    SELLER_PROFILE_NOT_FOUND: 'Seller profile not found',
    SELLER_NOT_APPROVED: 'Seller account not approved',
    INVALID_EMAIL_FORMAT: 'Invalid email format',
    WEAK_PASSWORD: 'Password does not meet security requirements',
    INVALID_TOKEN: 'Invalid or expired token',
    EMAIL_VERIFICATION_FAILED: 'Email verification failed',
  },

  // Success messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_UPDATED: 'Password updated successfully',
    SELLER_PROFILE_CREATED: 'Seller profile created successfully',
    SELLER_PROFILE_UPDATED: 'Seller profile updated successfully',
    SELLER_APPROVED: 'Seller approved successfully',
    LOGIN_SUCCESSFUL: 'Login successful',
    LOGOUT_SUCCESSFUL: 'Logout successful',
  },

  // Email templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    EMAIL_VERIFICATION: 'email-verification',
    PASSWORD_RESET: 'password-reset',
    SELLER_APPROVAL: 'seller-approval',
    SELLER_REJECTED: 'seller-rejected',
    ACCOUNT_SUSPENDED: 'account-suspended',
  },

  // Rate limiting
  RATE_LIMITS: {
    LOGIN_ATTEMPTS: {
      MAX_ATTEMPTS: 5,
      WINDOW_MINUTES: 15,
    },
    EMAIL_VERIFICATION: {
      MAX_ATTEMPTS: 3,
      WINDOW_MINUTES: 60,
    },
    PASSWORD_RESET: {
      MAX_ATTEMPTS: 3,
      WINDOW_MINUTES: 60,
    },
  },

  // Cache keys
  CACHE_KEYS: {
    USER_BY_ID: (id: string) => `user:${id}`,
    USER_BY_EMAIL: (email: string) => `user:email:${email}`,
    SELLER_PROFILE: (userId: string) => `seller_profile:${userId}`,
    EMAIL_VERIFICATION_TOKEN: (token: string) => `email_verification:${token}`,
    PASSWORD_RESET_TOKEN: (token: string) => `password_reset:${token}`,
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    USER_DATA: 3600, // 1 hour
    SELLER_PROFILE: 1800, // 30 minutes
    EMAIL_VERIFICATION_TOKEN: 86400, // 24 hours
    PASSWORD_RESET_TOKEN: 3600, // 1 hour
  },
} as const;
