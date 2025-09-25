# E-Commerce Backend - Node.js/Express Planning Document

## 🎯 Project Overview

### Repository: `ecommerce-backend`

**Technology**: Node.js + Express.js + Sequelize ORM + PostgreSQL
**Purpose**: REST API server for e-commerce platform
**Deployment**: Railway/Heroku/AWS

### Key Features

- **Authentication & Authorization**: JWT-based auth with role management
- **Product Management**: CRUD operations for products and categories
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe payment processing with webhooks
- **File Upload**: Image upload with Cloudinary integration
- **Email Services**: Transactional emails for orders and notifications
- **Admin Operations**: User management, seller approval, financial oversight

---

## 🏗️ Project Structure

```
ecommerce-backend/
├── src/
│   ├── controllers/           # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── uploadController.js
│   │   ├── adminController.js
│   │   └── webhookController.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── authorize.js      # Authorization middleware
│   │   ├── validation.js     # Request validation
│   │   ├── errorHandler.js   # Global error handling
│   │   ├── rateLimiter.js    # Rate limiting
│   │   ├── cors.js           # CORS configuration
│   │   ├── helmet.js         # Security headers
│   │   └── logger.js         # Request logging
│   ├── models/               # Sequelize models
│   │   ├── User.js
│   │   ├── SellerProfile.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── CartItem.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Transaction.js
│   │   ├── SellerPayout.js
│   │   ├── Review.js
│   │   ├── UserSession.js
│   │   └── index.js          # Model associations
│   ├── routes/               # Route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── cart.js
│   │   ├── reviews.js
│   │   ├── upload.js
│   │   ├── admin.js
│   │   └── index.js          # Route aggregation
│   ├── services/             # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── emailService.js
│   │   ├── uploadService.js
│   │   ├── notificationService.js
│   │   └── analyticsService.js
│   ├── utils/                # Utility functions
│   │   ├── jwt.js           # JWT utilities
│   │   ├── bcrypt.js        # Password hashing
│   │   ├── validation.js    # Validation schemas
│   │   ├── helpers.js       # General helpers
│   │   ├── constants.js     # App constants
│   │   ├── logger.js        # Winston logger
│   │   └── database.js      # Database utilities
│   ├── config/               # Configuration files
│   │   ├── database.js      # Database configuration
│   │   ├── stripe.js        # Stripe configuration
│   │   ├── cloudinary.js    # Cloudinary configuration
│   │   ├── email.js         # Email configuration
│   │   ├── redis.js         # Redis configuration
│   │   └── app.js           # App configuration
│   ├── jobs/                 # Background jobs
│   │   ├── emailJobs.js
│   │   ├── payoutJobs.js
│   │   ├── inventoryJobs.js
│   │   └── cleanupJobs.js
│   ├── seeders/              # Database seeders
│   │   ├── 001-users.js
│   │   ├── 002-categories.js
│   │   ├── 003-products.js
│   │   └── 004-orders.js
│   └── app.js                # Express app setup
├── migrations/               # Database migrations
│   ├── 001-create-users.js
│   ├── 002-create-seller-profiles.js
│   ├── 003-create-categories.js
│   ├── 004-create-products.js
│   ├── 005-create-carts.js
│   ├── 006-create-orders.js
│   ├── 007-create-transactions.js
│   └── 008-create-reviews.js
├── tests/                    # Test files
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── products.test.js
│   │   ├── orders.test.js
│   │   └── payments.test.js
│   ├── fixtures/
│   │   ├── users.js
│   │   ├── products.js
│   │   └── orders.js
│   └── setup.js
├── docs/                     # API documentation
│   ├── api.md
│   ├── authentication.md
│   ├── deployment.md
│   └── troubleshooting.md
├── logs/                     # Log files
├── uploads/                  # Temporary uploads
├── .env                      # Environment variables
├── .env.example              # Environment template
├── .sequelizerc              # Sequelize configuration
├── package.json              # Dependencies
├── server.js                 # Server entry point
├── README.md                 # Documentation
└── .gitignore               # Git ignore rules
```

---

## 📦 Dependencies & Configuration

### Package.json

```json
{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "description": "E-commerce platform backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "seed:undo": "sequelize-cli db:seed:undo:all",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "docs": "swagger-jsdoc -d swaggerDef.js src/routes/*.js -o docs/swagger.json"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",

    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",

    "joi": "^17.11.0",
    "express-validator": "^7.0.1",

    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-slow-down": "^2.0.1",

    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",

    "stripe": "^14.9.0",

    "nodemailer": "^6.9.7",
    "handlebars": "^4.7.8",

    "winston": "^3.11.0",
    "morgan": "^1.10.0",

    "dotenv": "^16.3.1",
    "express-async-errors": "^3.1.1",

    "bull": "^4.12.2",
    "redis": "^4.6.11",

    "moment": "^2.29.4",
    "lodash": "^4.17.21",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.2",

    "eslint": "^8.55.0",
    "eslint-config-node": "^4.1.0",
    "eslint-plugin-node": "^11.1.0",

    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",

    "@faker-js/faker": "^8.3.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Express App Configuration

```javascript
// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
require("express-async-errors");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

// Trust proxy (for deployment behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
      ];

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiting (slow down repeated requests)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

app.use("/api/", limiter);
app.use("/api/", speedLimiter);

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      // Store raw body for webhook verification
      if (req.originalUrl.includes("/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
```

---

## 🗄️ Database Models (Sequelize)

### User Model

```javascript
// src/models/User.js
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: "users_email_unique",
          msg: "Email address already in use",
        },
        validate: {
          isEmail: {
            msg: "Please provide a valid email address",
          },
          len: {
            args: [5, 255],
            msg: "Email must be between 5 and 255 characters",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [8, 255],
            msg: "Password must be at least 8 characters long",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: "Name must be between 2 and 100 characters",
          },
        },
      },
      role: {
        type: DataTypes.ENUM("customer", "seller", "admin"),
        defaultValue: "customer",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "suspended"),
        defaultValue: "approved",
        allowNull: false,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        field: "avatar_url",
        validate: {
          isUrl: {
            msg: "Avatar URL must be a valid URL",
          },
        },
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "email_verified",
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
        field: "email_verification_token",
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        field: "password_reset_token",
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        field: "password_reset_expires",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        field: "last_login_at",
      },
    },
    {
      tableName: "users",
      underscored: true,
      indexes: [
        {
          fields: ["email"],
        },
        {
          fields: ["role", "status"],
        },
        {
          fields: ["email_verification_token"],
        },
        {
          fields: ["password_reset_token"],
        },
      ],
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Instance methods
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    return values;
  };

  User.prototype.generatePasswordResetToken = function () {
    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return token;
  };

  User.prototype.generateEmailVerificationToken = function () {
    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    return token;
  };

  // Class methods
  User.findByEmail = function (email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findByPasswordResetToken = function (token) {
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    return this.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [sequelize.Sequelize.Op.gt]: new Date(),
        },
      },
    });
  };

  return User;
};
```

### Product Model

```javascript
// src/models/Product.js
const { DataTypes } = require("sequelize");
const slugify = require("slugify");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "seller_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      categoryId: {
        type: DataTypes.UUID,
        field: "category_id",
        references: {
          model: "categories",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: "Product name must be between 2 and 255 characters",
          },
        },
      },
      slug: {
        type: DataTypes.STRING,
        unique: {
          name: "products_slug_unique",
          msg: "Product slug must be unique",
        },
        validate: {
          len: {
            args: [2, 255],
            msg: "Product slug must be between 2 and 255 characters",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [10, 10000],
            msg: "Description must be between 10 and 10000 characters",
          },
        },
      },
      shortDescription: {
        type: DataTypes.STRING(500),
        field: "short_description",
        validate: {
          len: {
            args: [10, 500],
            msg: "Short description must be between 10 and 500 characters",
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0.01],
            msg: "Price must be greater than 0",
          },
          max: {
            args: [999999.99],
            msg: "Price cannot exceed 999,999.99",
          },
        },
      },
      comparePrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: "compare_price",
        validate: {
          min: {
            args: [0.01],
            msg: "Compare price must be greater than 0",
          },
          isGreaterThanPrice(value) {
            if (value && value <= this.price) {
              throw new Error(
                "Compare price must be greater than regular price"
              );
            }
          },
        },
      },
      costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: "cost_price",
        validate: {
          min: {
            args: [0],
            msg: "Cost price cannot be negative",
          },
        },
      },
      sku: {
        type: DataTypes.STRING(100),
        unique: {
          name: "products_sku_unique",
          msg: "SKU must be unique",
        },
        validate: {
          len: {
            args: [2, 100],
            msg: "SKU must be between 2 and 100 characters",
          },
        },
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "stock_quantity",
        validate: {
          min: {
            args: [0],
            msg: "Stock quantity cannot be negative",
          },
        },
      },
      lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        field: "low_stock_threshold",
        validate: {
          min: {
            args: [0],
            msg: "Low stock threshold cannot be negative",
          },
        },
      },
      weight: {
        type: DataTypes.DECIMAL(8, 2),
        validate: {
          min: {
            args: [0],
            msg: "Weight cannot be negative",
          },
        },
      },
      dimensions: {
        type: DataTypes.JSON,
        validate: {
          isValidDimensions(value) {
            if (value && typeof value === "object") {
              const { length, width, height } = value;
              if (length && (typeof length !== "number" || length <= 0)) {
                throw new Error("Length must be a positive number");
              }
              if (width && (typeof width !== "number" || width <= 0)) {
                throw new Error("Width must be a positive number");
              }
              if (height && (typeof height !== "number" || height <= 0)) {
                throw new Error("Height must be a positive number");
              }
            }
          },
        },
      },
      images: {
        type: DataTypes.JSON,
        defaultValue: [],
        validate: {
          isValidImages(value) {
            if (value && Array.isArray(value)) {
              if (value.length > 10) {
                throw new Error("Maximum 10 images allowed");
              }
              value.forEach((url) => {
                if (typeof url !== "string" || !url.match(/^https?:\/\/.+/)) {
                  throw new Error("All images must be valid URLs");
                }
              });
            }
          },
        },
      },
      status: {
        type: DataTypes.ENUM("draft", "active", "inactive", "out_of_stock"),
        defaultValue: "draft",
        allowNull: false,
      },
      seoTitle: {
        type: DataTypes.STRING,
        field: "seo_title",
        validate: {
          len: {
            args: [0, 255],
            msg: "SEO title cannot exceed 255 characters",
          },
        },
      },
      seoDescription: {
        type: DataTypes.STRING(500),
        field: "seo_description",
        validate: {
          len: {
            args: [0, 500],
            msg: "SEO description cannot exceed 500 characters",
          },
        },
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: [],
        validate: {
          isValidTags(value) {
            if (value && Array.isArray(value)) {
              if (value.length > 20) {
                throw new Error("Maximum 20 tags allowed");
              }
              value.forEach((tag) => {
                if (typeof tag !== "string" || tag.length > 50) {
                  throw new Error(
                    "Each tag must be a string with maximum 50 characters"
                  );
                }
              });
            }
          },
        },
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "view_count",
      },
      averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        field: "average_rating",
        validate: {
          min: 0,
          max: 5,
        },
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "review_count",
      },
    },
    {
      tableName: "products",
      underscored: true,
      indexes: [
        {
          fields: ["seller_id", "status"],
        },
        {
          fields: ["category_id", "status"],
        },
        {
          fields: ["price"],
        },
        {
          fields: ["stock_quantity"],
        },
        {
          fields: ["status", "created_at"],
        },
        {
          fields: ["slug"],
        },
        {
          type: "FULLTEXT",
          fields: ["name", "description"],
        },
      ],
      hooks: {
        beforeValidate: (product) => {
          if (product.name && !product.slug) {
            product.slug = slugify(product.name, {
              lower: true,
              strict: true,
              remove: /[*+~.()'"!:@]/g,
            });
          }

          // Auto-update status based on stock
          if (product.stockQuantity === 0 && product.status === "active") {
            product.status = "out_of_stock";
          }
        },
      },
    }
  );

  // Instance methods
  Product.prototype.isInStock = function () {
    return this.stockQuantity > 0;
  };

  Product.prototype.isLowStock = function () {
    return this.stockQuantity <= this.lowStockThreshold;
  };

  Product.prototype.getDiscountPercentage = function () {
    if (!this.comparePrice || this.comparePrice <= this.price) {
      return 0;
    }
    return Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100
    );
  };

  Product.prototype.incrementViewCount = async function () {
    await this.increment("viewCount");
  };

  // Class methods
  Product.findBySlug = function (slug) {
    return this.findOne({
      where: { slug },
      include: ["seller", "category"],
    });
  };

  Product.findActiveProducts = function (options = {}) {
    return this.findAll({
      where: {
        status: "active",
        stockQuantity: { [sequelize.Sequelize.Op.gt]: 0 },
      },
      ...options,
    });
  };

  return Product;
};
```

### Order Model

```javascript
// src/models/Order.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      orderNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        field: "order_number",
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded"
        ),
        defaultValue: "pending",
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        field: "tax_amount",
        validate: {
          min: 0,
        },
      },
      shippingAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        field: "shipping_amount",
        validate: {
          min: 0,
        },
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        field: "discount_amount",
        validate: {
          min: 0,
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_amount",
        validate: {
          min: 0,
        },
      },
      shippingAddress: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "shipping_address",
        validate: {
          isValidAddress(value) {
            const required = [
              "firstName",
              "lastName",
              "address1",
              "city",
              "postalCode",
              "country",
            ];
            const missing = required.filter((field) => !value[field]);
            if (missing.length > 0) {
              throw new Error(
                `Missing required address fields: ${missing.join(", ")}`
              );
            }
          },
        },
      },
      billingAddress: {
        type: DataTypes.JSON,
        field: "billing_address",
      },
      trackingNumber: {
        type: DataTypes.STRING,
        field: "tracking_number",
      },
      trackingUrl: {
        type: DataTypes.STRING(500),
        field: "tracking_url",
        validate: {
          isUrl: {
            msg: "Tracking URL must be a valid URL",
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
      },
      internalNotes: {
        type: DataTypes.TEXT,
        field: "internal_notes",
      },
      shippedAt: {
        type: DataTypes.DATE,
        field: "shipped_at",
      },
      deliveredAt: {
        type: DataTypes.DATE,
        field: "delivered_at",
      },
      cancelledAt: {
        type: DataTypes.DATE,
        field: "cancelled_at",
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        field: "cancellation_reason",
      },
    },
    {
      tableName: "orders",
      underscored: true,
      indexes: [
        {
          fields: ["user_id", "status"],
        },
        {
          fields: ["order_number"],
        },
        {
          fields: ["status", "created_at"],
        },
        {
          fields: ["created_at"],
        },
      ],
      hooks: {
        beforeCreate: async (order) => {
          if (!order.orderNumber) {
            // Generate order number: ORD-YYYYMMDD-XXXXX
            const date = new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "");
            const random = Math.floor(Math.random() * 100000)
              .toString()
              .padStart(5, "0");
            order.orderNumber = `ORD-${date}-${random}`;
          }

          // Calculate total amount
          const total =
            parseFloat(order.subtotal) +
            parseFloat(order.taxAmount) +
            parseFloat(order.shippingAmount) -
            parseFloat(order.discountAmount);
          order.totalAmount = total.toFixed(2);
        },
        beforeUpdate: (order) => {
          // Set timestamps for status changes
          if (order.changed("status")) {
            const now = new Date();
            switch (order.status) {
              case "shipped":
                if (!order.shippedAt) order.shippedAt = now;
                break;
              case "delivered":
                if (!order.deliveredAt) order.deliveredAt = now;
                break;
              case "cancelled":
                if (!order.cancelledAt) order.cancelledAt = now;
                break;
            }
          }
        },
      },
    }
  );

  // Instance methods
  Order.prototype.canBeCancelled = function () {
    return ["pending", "confirmed"].includes(this.status);
  };

  Order.prototype.canBeShipped = function () {
    return ["confirmed", "processing"].includes(this.status);
  };

  Order.prototype.isDelivered = function () {
    return this.status === "delivered";
  };

  Order.prototype.getStatusHistory = async function () {
    // This would require a separate OrderStatusHistory model
    // For now, return basic status info
    return {
      current: this.status,
      createdAt: this.createdAt,
      shippedAt: this.shippedAt,
      deliveredAt: this.deliveredAt,
      cancelledAt: this.cancelledAt,
    };
  };

  // Class methods
  Order.findByOrderNumber = function (orderNumber) {
    return this.findOne({
      where: { orderNumber },
      include: ["user", "items", "transactions"],
    });
  };

  Order.findUserOrders = function (userId, options = {}) {
    return this.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: ["items"],
      ...options,
    });
  };

  return Order;
};
```

---

## 🔐 Authentication & Authorization

### JWT Utilities

```javascript
// src/utils/jwt.js
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || this.secret;
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: "ecommerce-api",
      audience: "ecommerce-frontend",
    });

    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: "ecommerce-api",
      audience: "ecommerce-frontend",
    });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, this.secret);
      return { success: true, decoded };
    } catch (error) {
      return {
        success: false,
        error:
          error.name === "TokenExpiredError"
            ? "TOKEN_EXPIRED"
            : "INVALID_TOKEN",
      };
    }
  }

  async verifyRefreshToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, this.refreshSecret);
      return { success: true, decoded };
    } catch (error) {
      return {
        success: false,
        error:
          error.name === "TokenExpiredError"
            ? "REFRESH_TOKEN_EXPIRED"
            : "INVALID_REFRESH_TOKEN",
      };
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }

  getTokenExpiry(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JWTService();
```

### Authentication Middleware

```javascript
// src/middleware/auth.js
const jwtService = require("../utils/jwt");
const { User } = require("../models");
const logger = require("../utils/logger");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_TOKEN",
          message: "Access token is required",
        },
      });
    }

    const { success, decoded, error } = await jwtService.verifyAccessToken(
      token
    );

    if (!success) {
      return res.status(401).json({
        success: false,
        error: {
          code: error,
          message:
            error === "TOKEN_EXPIRED"
              ? "Access token has expired"
              : "Invalid access token",
        },
      });
    }

    // Fetch user from database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User associated with token not found",
        },
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: "Your account has been suspended",
        },
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    // Update last login time (optional, can be done less frequently)
    if (Math.random() < 0.1) {
      // 10% chance to update
      user
        .update({ lastLoginAt: new Date() })
        .catch((err) => logger.error("Failed to update last login time:", err));
    }

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed",
      },
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    const { success, decoded } = await jwtService.verifyAccessToken(token);

    if (success) {
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["password"] },
      });

      if (user && user.status !== "suspended") {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    logger.error("Optional authentication error:", error);
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
```

### Authorization Middleware

```javascript
// src/middleware/authorize.js
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication required",
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Insufficient permissions to access this resource",
        },
      });
    }

    next();
  };
};

const authorizeOwnership = (resourceIdParam = "id", userIdField = "userId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required",
          },
        });
      }

      // Admin can access everything
      if (req.user.role === "admin") {
        return next();
      }

      const resourceId = req.params[resourceIdParam];

      // For sellers, check if they own the resource
      if (req.user.role === "seller") {
        // This would need to be customized based on the resource type
        // For now, we'll assume the resource has a sellerId field
        const resource = await req.model.findByPk(resourceId);

        if (!resource) {
          return res.status(404).json({
            success: false,
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "Resource not found",
            },
          });
        }

        if (resource.sellerId !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: {
              code: "RESOURCE_ACCESS_DENIED",
              message: "You can only access your own resources",
            },
          });
        }
      }

      // For customers, check if they own the resource
      if (req.user.role === "customer") {
        const resource = await req.model.findByPk(resourceId);

        if (!resource) {
          return res.status(404).json({
            success: false,
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "Resource not found",
            },
          });
        }

        if (resource[userIdField] !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: {
              code: "RESOURCE_ACCESS_DENIED",
              message: "You can only access your own resources",
            },
          });
        }
      }

      next();
    } catch (error) {
      logger.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Authorization failed",
        },
      });
    }
  };
};

module.exports = {
  authorize,
  authorizeOwnership,
};
```

---

## 🛣️ Controllers & Services

### Authentication Controller

```javascript
// src/controllers/authController.js
const authService = require("../services/authService");
const jwtService = require("../utils/jwt");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

class AuthController {
  async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: errors.array(),
          },
        });
      }

      const { email, password, name, role } = req.body;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "User with this email already exists",
          },
        });
      }

      // Create user
      const user = await authService.createUser({
        email,
        password,
        name,
        role: role || "customer",
      });

      // Generate tokens
      const { accessToken, refreshToken } = jwtService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Log registration
      logger.info(`User registered: ${user.email}`, {
        userId: user.id,
        role: user.role,
        ip: req.ip,
      });

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
        message: "User registered successfully",
      });
    } catch (error) {
      logger.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "REGISTRATION_FAILED",
          message: "Registration failed. Please try again.",
        },
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: errors.array(),
          },
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }

      // Check account status
      if (user.status === "suspended") {
        return res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Your account has been suspended",
          },
        });
      }

      if (user.status === "pending" && user.role === "seller") {
        return res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_PENDING",
            message: "Your seller account is pending approval",
          },
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = jwtService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Log login
      logger.info(`User logged in: ${user.email}`, {
        userId: user.id,
        role: user.role,
        ip: req.ip,
      });

      res.json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
        message: "Login successful",
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "LOGIN_FAILED",
          message: "Login failed. Please try again.",
        },
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: "REFRESH_TOKEN_REQUIRED",
            message: "Refresh token is required",
          },
        });
      }

      const { success, decoded, error } = await jwtService.verifyRefreshToken(
        refreshToken
      );

      if (!success) {
        return res.status(401).json({
          success: false,
          error: {
            code: error,
            message: "Invalid or expired refresh token",
          },
        });
      }

      // Find user
      const user = await authService.findUserById(decoded.userId);
      if (!user || user.status === "suspended") {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_USER",
            message: "User not found or suspended",
          },
        });
      }

      // Generate new tokens
      const tokens = jwtService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        data: tokens,
        message: "Tokens refreshed successfully",
      });
    } catch (error) {
      logger.error("Token refresh error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "TOKEN_REFRESH_FAILED",
          message: "Token refresh failed",
        },
      });
    }
  }

  async logout(req, res) {
    try {
      // In a more sophisticated implementation, you might:
      // 1. Blacklist the token
      // 2. Remove refresh token from database
      // 3. Clear any session data

      logger.info(`User logged out: ${req.user.email}`, {
        userId: req.user.id,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "LOGOUT_FAILED",
          message: "Logout failed",
        },
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      logger.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "USER_FETCH_FAILED",
          message: "Failed to fetch user data",
        },
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: errors.array(),
          },
        });
      }

      const { name, avatarUrl } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (avatarUrl) updateData.avatarUrl = avatarUrl;

      const updatedUser = await req.user.update(updateData);

      logger.info(`User profile updated: ${req.user.email}`, {
        userId: req.user.id,
        changes: Object.keys(updateData),
      });

      res.json({
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
      });
    } catch (error) {
      logger.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "PROFILE_UPDATE_FAILED",
          message: "Profile update failed",
        },
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: errors.array(),
          },
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isValidPassword = await req.user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_CURRENT_PASSWORD",
            message: "Current password is incorrect",
          },
        });
      }

      // Update password
      await req.user.update({ password: newPassword });

      logger.info(`Password changed: ${req.user.email}`, {
        userId: req.user.id,
      });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      logger.error("Password change error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "PASSWORD_CHANGE_FAILED",
          message: "Password change failed",
        },
      });
    }
  }
}

module.exports = new AuthController();
```

### Product Service

```javascript
// src/services/productService.js
const { Product, User, Category, Review } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

class ProductService {
  async getAllProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        search,
        minPrice,
        maxPrice,
        sortBy = "createdAt",
        sortOrder = "DESC",
        sellerId,
        status = "active",
      } = filters;

      const where = {};
      const include = [
        {
          model: User,
          as: "seller",
          attributes: ["id", "name", "avatarUrl"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ];

      // Status filter
      if (status) {
        where.status = status;
      }

      // Category filter
      if (category) {
        where.categoryId = category;
      }

      // Seller filter
      if (sellerId) {
        where.sellerId = sellerId;
      }

      // Search filter
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { shortDescription: { [Op.like]: `%${search}%` } },
        ];
      }

      // Price range filter
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = minPrice;
        if (maxPrice) where.price[Op.lte] = maxPrice;
      }

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder.toUpperCase()]];

      const { count, rows } = await Product.findAndCountAll({
        where,
        include,
        order,
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      return {
        products: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error("Get products error:", error);
      throw new Error("Failed to fetch products");
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "name", "email", "avatarUrl"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
        ],
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Increment view count
      await product.incrementViewCount();

      return product;
    } catch (error) {
      logger.error("Get product by ID error:", error);
      throw error;
    }
  }

  async getProductBySlug(slug) {
    try {
      const product = await Product.findBySlug(slug);

      if (!product) {
        throw new Error("Product not found");
      }

      // Increment view count
      await product.incrementViewCount();

      return product;
    } catch (error) {
      logger.error("Get product by slug error:", error);
      throw error;
    }
  }

  async createProduct(productData, sellerId) {
    try {
      const product = await Product.create({
        ...productData,
        sellerId,
      });

      return await this.getProductById(product.id);
    } catch (error) {
      logger.error("Create product error:", error);
      throw new Error("Failed to create product");
    }
  }

  async updateProduct(id, productData, userId, userRole) {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw new Error("Product not found");
      }

      // Check ownership (sellers can only update their own products)
      if (userRole === "seller" && product.sellerId !== userId) {
        throw new Error("You can only update your own products");
      }

      await product.update(productData);
      return await this.getProductById(id);
    } catch (error) {
      logger.error("Update product error:", error);
      throw error;
    }
  }

  async deleteProduct(id, userId, userRole) {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw new Error("Product not found");
      }

      // Check ownership
      if (userRole === "seller" && product.sellerId !== userId) {
        throw new Error("You can only delete your own products");
      }

      await product.destroy();
      return { message: "Product deleted successfully" };
    } catch (error) {
      logger.error("Delete product error:", error);
      throw error;
    }
  }

  async getRelatedProducts(productId, categoryId, limit = 8) {
    try {
      const where = {
        id: { [Op.ne]: productId },
        status: "active",
      };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      const products = await Product.findAll({
        where,
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["averageRating", "DESC"],
          ["createdAt", "DESC"],
        ],
        limit,
      });

      return products;
    } catch (error) {
      logger.error("Get related products error:", error);
      throw new Error("Failed to fetch related products");
    }
  }

  async updateProductRating(productId) {
    try {
      const reviews = await Review.findAll({
        where: { productId },
        attributes: ["rating"],
      });

      if (reviews.length === 0) {
        await Product.update(
          { averageRating: 0, reviewCount: 0 },
          { where: { id: productId } }
        );
        return;
      }

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = (totalRating / reviews.length).toFixed(2);

      await Product.update(
        {
          averageRating: parseFloat(averageRating),
          reviewCount: reviews.length,
        },
        { where: { id: productId } }
      );
    } catch (error) {
      logger.error("Update product rating error:", error);
      throw new Error("Failed to update product rating");
    }
  }

  async searchProducts(query, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        minPrice,
        maxPrice,
        sortBy = "relevance",
      } = filters;

      const where = {
        status: "active",
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { shortDescription: { [Op.like]: `%${query}%` } },
        ],
      };

      // Apply additional filters
      if (category) where.categoryId = category;
      if (minPrice) where.price = { ...where.price, [Op.gte]: minPrice };
      if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };

      const offset = (page - 1) * limit;
      let order;

      switch (sortBy) {
        case "price_low":
          order = [["price", "ASC"]];
          break;
        case "price_high":
          order = [["price", "DESC"]];
          break;
        case "rating":
          order = [["averageRating", "DESC"]];
          break;
        case "newest":
          order = [["createdAt", "DESC"]];
          break;
        default:
          // Relevance - prioritize name matches over description matches
          order = [
            [
              sequelize.literal(`CASE
              WHEN name LIKE '%${query}%' THEN 1
              WHEN short_description LIKE '%${query}%' THEN 2
              ELSE 3
            END`),
              "ASC",
            ],
            ["averageRating", "DESC"],
          ];
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "name"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
        ],
        order,
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      return {
        products: rows,
        query,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error("Search products error:", error);
      throw new Error("Product search failed");
    }
  }
}

module.exports = new ProductService();
```

---

## 💳 Payment Integration (Stripe)

### Payment Service

```javascript
// src/services/paymentService.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Order, Transaction, User } = require("../models");
const logger = require("../utils/logger");

class PaymentService {
  async createPaymentIntent(orderId, userId) {
    try {
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: ["user", "items"],
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "pending") {
        throw new Error("Order cannot be paid");
      }

      // Create or retrieve Stripe customer
      let customer = await this.getOrCreateStripeCustomer(order.user);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: "usd",
        customer: customer.id,
        metadata: {
          orderId: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Payment for order ${order.orderNumber}`,
      });

      // Create transaction record
      await Transaction.create({
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.totalAmount,
        currency: "usd",
        status: "pending",
        paymentMethod: "card",
      });

      logger.info(`Payment intent created for order ${order.orderNumber}`, {
        orderId: order.id,
        paymentIntentId: paymentIntent.id,
        amount: order.totalAmount,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error("Create payment intent error:", error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId, orderId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment not successful");
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Update transaction
      await Transaction.update(
        {
          status: "succeeded",
          paymentMethodDetails: paymentIntent.payment_method
            ? {
                type: paymentIntent.payment_method.type,
                last4: paymentIntent.payment_method.card?.last4,
                brand: paymentIntent.payment_method.card?.brand,
              }
            : null,
        },
        { where: { stripePaymentIntentId: paymentIntentId } }
      );

      // Update order status
      await order.update({ status: "confirmed" });

      logger.info(`Payment confirmed for order ${order.orderNumber}`, {
        orderId: order.id,
        paymentIntentId,
        amount: order.totalAmount,
      });

      return { order, paymentIntent };
    } catch (error) {
      logger.error("Confirm payment error:", error);
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentFailed(event.data.object);
          break;

        case "payment_intent.canceled":
          await this.handlePaymentCanceled(event.data.object);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error("Webhook handling error:", error);
      throw error;
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    try {
      const transaction = await Transaction.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: ["order"],
      });

      if (!transaction) {
        logger.error(
          `Transaction not found for payment intent: ${paymentIntent.id}`
        );
        return;
      }

      // Update transaction
      await transaction.update({
        status: "succeeded",
        paymentMethodDetails: paymentIntent.payment_method
          ? {
              type: paymentIntent.payment_method.type,
              last4: paymentIntent.payment_method.card?.last4,
              brand: paymentIntent.payment_method.card?.brand,
            }
          : null,
      });

      // Update order
      await transaction.order.update({ status: "confirmed" });

      // Send confirmation email
      await this.sendPaymentConfirmationEmail(transaction.order);

      logger.info(`Payment succeeded webhook processed`, {
        paymentIntentId: paymentIntent.id,
        orderId: transaction.orderId,
      });
    } catch (error) {
      logger.error("Handle payment succeeded error:", error);
      throw error;
    }
  }

  async handlePaymentFailed(paymentIntent) {
    try {
      const transaction = await Transaction.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: ["order"],
      });

      if (!transaction) {
        logger.error(
          `Transaction not found for payment intent: ${paymentIntent.id}`
        );
        return;
      }

      // Update transaction
      await transaction.update({
        status: "failed",
        failureReason:
          paymentIntent.last_payment_error?.message || "Payment failed",
      });

      logger.info(`Payment failed webhook processed`, {
        paymentIntentId: paymentIntent.id,
        orderId: transaction.orderId,
        reason: paymentIntent.last_payment_error?.message,
      });
    } catch (error) {
      logger.error("Handle payment failed error:", error);
      throw error;
    }
  }

  async handlePaymentCanceled(paymentIntent) {
    try {
      const transaction = await Transaction.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (!transaction) {
        logger.error(
          `Transaction not found for payment intent: ${paymentIntent.id}`
        );
        return;
      }

      await transaction.update({ status: "cancelled" });

      logger.info(`Payment canceled webhook processed`, {
        paymentIntentId: paymentIntent.id,
        orderId: transaction.orderId,
      });
    } catch (error) {
      logger.error("Handle payment canceled error:", error);
      throw error;
    }
  }

  async getOrCreateStripeCustomer(user) {
    try {
      // Check if user already has a Stripe customer ID
      if (user.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(
            user.stripeCustomerId
          );
          return customer;
        } catch (error) {
          // Customer doesn't exist in Stripe, create new one
          logger.warn(
            `Stripe customer ${user.stripeCustomerId} not found, creating new one`
          );
        }
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      // Update user with Stripe customer ID
      await user.update({ stripeCustomerId: customer.id });

      return customer;
    } catch (error) {
      logger.error("Get or create Stripe customer error:", error);
      throw error;
    }
  }

  async createRefund(transactionId, amount, reason) {
    try {
      const transaction = await Transaction.findByPk(transactionId, {
        include: ["order"],
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status !== "succeeded") {
        throw new Error("Cannot refund unsuccessful transaction");
      }

      const refundAmount = amount ? Math.round(amount * 100) : undefined;

      const refund = await stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId,
        amount: refundAmount,
        reason: reason || "requested_by_customer",
        metadata: {
          orderId: transaction.orderId,
          transactionId: transaction.id,
        },
      });

      // Update transaction status
      await transaction.update({
        status: refundAmount ? "partially_refunded" : "refunded",
      });

      // Update order status if fully refunded
      if (
        !refundAmount ||
        refundAmount === Math.round(transaction.amount * 100)
      ) {
        await transaction.order.update({ status: "refunded" });
      }

      logger.info(`Refund created`, {
        refundId: refund.id,
        transactionId: transaction.id,
        amount: refundAmount / 100 || transaction.amount,
      });

      return refund;
    } catch (error) {
      logger.error("Create refund error:", error);
      throw error;
    }
  }

  async sendPaymentConfirmationEmail(order) {
    try {
      const emailService = require("./emailService");
      await emailService.sendOrderConfirmation(order);
    } catch (error) {
      logger.error("Send payment confirmation email error:", error);
      // Don't throw error as this is not critical
    }
  }
}

module.exports = new PaymentService();
```

---

## 📧 Email Service

### Email Service Implementation

```javascript
// src/services/emailService.js
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, "../templates/email");
      const templateFiles = [
        "welcome.hbs",
        "order-confirmation.hbs",
        "order-shipped.hbs",
        "password-reset.hbs",
        "seller-approved.hbs",
        "seller-rejected.hbs",
      ];

      for (const file of templateFiles) {
        const templatePath = path.join(templatesDir, file);
        const templateContent = await fs.readFile(templatePath, "utf8");
        const templateName = file.replace(".hbs", "");
        this.templates.set(templateName, handlebars.compile(templateContent));
      }

      logger.info("Email templates loaded successfully");
    } catch (error) {
      logger.error("Failed to load email templates:", error);
    }
  }

  async sendEmail(to, subject, templateName, data = {}) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const html = template({
        ...data,
        appUrl: process.env.APP_URL,
        supportEmail: process.env.SUPPORT_EMAIL || "support@yourstore.com",
        companyName: process.env.COMPANY_NAME || "Your Store",
      });

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || "Your Store"}" <${
          process.env.SMTP_USER
        }>`,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully`, {
        to,
        subject,
        template: templateName,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error("Send email error:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    try {
      await this.sendEmail(user.email, "Welcome to Your Store!", "welcome", {
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      logger.error("Send welcome email error:", error);
      throw error;
    }
  }

  async sendOrderConfirmation(order) {
    try {
      const orderWithDetails = await Order.findByPk(order.id, {
        include: [
          "user",
          {
            model: OrderItem,
            as: "items",
            include: ["product"],
          },
        ],
      });

      await this.sendEmail(
        orderWithDetails.user.email,
        `Order Confirmation - ${orderWithDetails.orderNumber}`,
        "order-confirmation",
        {
          order: orderWithDetails,
          user: orderWithDetails.user,
          items: orderWithDetails.items,
          shippingAddress: orderWithDetails.shippingAddress,
        }
      );
    } catch (error) {
      logger.error("Send order confirmation email error:", error);
      throw error;
    }
  }

  async sendOrderShipped(order, trackingInfo) {
    try {
      const orderWithDetails = await Order.findByPk(order.id, {
        include: ["user", "items"],
      });

      await this.sendEmail(
        orderWithDetails.user.email,
        `Your Order Has Shipped - ${orderWithDetails.orderNumber}`,
        "order-shipped",
        {
          order: orderWithDetails,
          user: orderWithDetails.user,
          trackingNumber: trackingInfo.trackingNumber,
          trackingUrl: trackingInfo.trackingUrl,
          estimatedDelivery: trackingInfo.estimatedDelivery,
        }
      );
    } catch (error) {
      logger.error("Send order shipped email error:", error);
      throw error;
    }
  }

  async sendPasswordReset(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await this.sendEmail(
        user.email,
        "Password Reset Request",
        "password-reset",
        {
          name: user.name,
          resetUrl,
          expiresIn: "10 minutes",
        }
      );
    } catch (error) {
      logger.error("Send password reset email error:", error);
      throw error;
    }
  }

  async sendSellerApproved(seller) {
    try {
      await this.sendEmail(
        seller.email,
        "Your Seller Account Has Been Approved!",
        "seller-approved",
        {
          name: seller.name,
          dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/seller`,
        }
      );
    } catch (error) {
      logger.error("Send seller approved email error:", error);
      throw error;
    }
  }

  async sendSellerRejected(seller, reason) {
    try {
      await this.sendEmail(
        seller.email,
        "Seller Account Application Update",
        "seller-rejected",
        {
          name: seller.name,
          reason,
          supportEmail: process.env.SUPPORT_EMAIL,
        }
      );
    } catch (error) {
      logger.error("Send seller rejected email error:", error);
      throw error;
    }
  }

  async sendBulkEmail(recipients, subject, templateName, data = {}) {
    try {
      const promises = recipients.map((recipient) =>
        this.sendEmail(recipient.email, subject, templateName, {
          ...data,
          name: recipient.name,
        })
      );

      await Promise.allSettled(promises);

      logger.info(`Bulk email sent`, {
        recipients: recipients.length,
        subject,
        template: templateName,
      });
    } catch (error) {
      logger.error("Send bulk email error:", error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("Email service connection verified");
      return true;
    } catch (error) {
      logger.error("Email service connection failed:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
```

---

## 🧪 Testing Strategy

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/migrations/**",
    "!src/seeders/**",
    "!src/config/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Integration Tests

```javascript
// tests/integration/auth.test.js
const request = require("supertest");
const app = require("../../src/app");
const { User } = require("../../src/models");
const { setupTestDB, cleanupTestDB } = require("../setup");

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe("POST /api/auth/register", () => {
    const validUserData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.name).toBe(validUserData.name);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...validUserData,
          email: "invalid-email",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 409 for duplicate email", async () => {
      await User.create(validUserData);

      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("USER_EXISTS");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("test@example.com");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken;

    beforeEach(async () => {
      const user = await User.create({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      authToken = loginResponse.body.data.accessToken;
    });

    it("should return current user data", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("test@example.com");
      expect(response.body.data.password).toBeUndefined();
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });
  });
});
```

---

## 🚀 Deployment & Environment

### Environment Variables

```bash
# .env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_prod
DB_USER=ecommerce_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (for sessions/caching)
REDIS_URL=redis://localhost:6379

# Frontend URL
FRONTEND_URL=https://yourstore.com
ALLOWED_ORIGINS=https://yourstore.com,https://admin.yourstore.com

# App Settings
COMPANY_NAME=Your Store
SUPPORT_EMAIL=support@yourstore.com
```

### Railway Deployment

```javascript
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📚 Learning Outcomes

### Technical Skills You'll Master

#### **Express.js Architecture**

- **Why Important**: Industry-standard Node.js web framework
- **What You'll Learn**:
  - Middleware patterns and custom middleware
  - Route organization and modular structure
  - Error handling and async error management
  - Security best practices (CORS, Helmet, Rate limiting)

#### **Database Design with Sequelize**

- **Why Important**: ORM provides abstraction and type safety
- **What You'll Learn**:
  - Model definitions and associations
  - Migration management and versioning
  - Query optimization and indexing
  - Transaction handling for data consistency

#### **Authentication & Security**

- **Why Important**: Critical for any production application
- **What You'll Learn**:
  - JWT token generation and validation
  - Password hashing with bcrypt
  - Role-based authorization patterns
  - API security best practices

#### **Payment Processing**

- **Why Important**: Revenue generation and financial compliance
- **What You'll Learn**:
  - Stripe integration and webhook handling
  - Payment intent creation and confirmation
  - Refund processing and dispute management
  - Financial transaction tracking

#### **API Design Principles**

- **Why Important**: Clean APIs enable scalable systems
- **What You'll Learn**:
  - RESTful endpoint design
  - Consistent error handling
  - Request validation and sanitization
  - API documentation and testing

This backend planning document provides a complete roadmap for building a robust, scalable e-commerce API with Node.js and Express. Every component is designed with security, performance, and maintainability in mind.

Ready to proceed with the database planning document! 🚀
