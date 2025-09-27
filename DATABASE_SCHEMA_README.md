# E-Commerce Database Schema

This document describes the complete database schema for the e-commerce platform, implemented in PostgreSQL with Clean Architecture principles.

## 🗄️ Database Overview

- **Database**: PostgreSQL 15+
- **Total Tables**: 20 tables
- **Architecture**: Clean Architecture with Domain-Driven Design
- **Features**: UUID primary keys, soft deletes, audit trails, full-text search

## 📊 Database Schema Summary

### Core Tables

| Table                | Purpose                                    | Key Features                                |
| -------------------- | ------------------------------------------ | ------------------------------------------- |
| `users`              | User accounts (customers, sellers, admins) | Role-based access, authentication, security |
| `user_sessions`      | JWT session management                     | Token tracking, device info                 |
| `seller_profiles`    | Business information for sellers           | Verification workflow, metrics              |
| `categories`         | Product categorization                     | Hierarchical structure, SEO                 |
| `products`           | Product catalog                            | Full-text search, variants, analytics       |
| `product_variants`   | Product variations                         | Size, color, price overrides                |
| `carts`              | Shopping carts                             | Guest and user carts, totals                |
| `cart_items`         | Items in carts                             | Product snapshots, quantities               |
| `orders`             | Customer orders                            | Complete order lifecycle                    |
| `order_items`        | Items in orders                            | Commission calculation, seller splits       |
| `transactions`       | Payment processing                         | Stripe integration, webhooks                |
| `seller_payouts`     | Seller payments                            | Commission tracking, payout history         |
| `payout_items`       | Payout item details                        | Individual order item payouts               |
| `reviews`            | Product reviews                            | Ratings, moderation, helpfulness            |
| `review_helpfulness` | Review voting                              | Helpful/not helpful votes                   |
| `coupons`            | Discount codes                             | Percentage/fixed discounts, usage limits    |
| `coupon_usage`       | Coupon redemptions                         | Usage tracking, order linking               |
| `notifications`      | User notifications                         | Multi-channel delivery                      |
| `settings`           | System configuration                       | Key-value settings, categories              |
| `audit_logs`         | Change tracking                            | Complete audit trail                        |

## 🚀 Quick Start

### 1. Database Setup

```bash
# Test database connection
npm run db:test

# Initialize complete database schema
npm run db:init

# Seed with sample data
npm run db:seed

# Complete setup (drop, init, seed)
npm run db:setup

# Drop all tables (careful!)
npm run db:drop
```

### 2. Environment Configuration

Ensure your `.env` file has the correct database credentials:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

## 📋 Detailed Schema

### 1. Users & Authentication

#### `users` Table

- **Purpose**: Central user management for all user types
- **Key Features**:
  - Role-based access (customer, seller, admin)
  - Email verification and password reset
  - Two-factor authentication support
  - Account status management
  - Stripe customer integration
  - Security tracking (login attempts, lockouts)

#### `user_sessions` Table

- **Purpose**: JWT session management and device tracking
- **Key Features**:
  - Token hash storage
  - Device and location tracking
  - Session expiration management
  - Security monitoring

### 2. Seller Management

#### `seller_profiles` Table

- **Purpose**: Business information and verification for sellers
- **Key Features**:
  - Business type classification
  - Document verification workflow
  - Bank account details (encrypted)
  - Performance metrics
  - Commission rate management
  - Vacation mode support

### 3. Product Catalog

#### `categories` Table

- **Purpose**: Hierarchical product categorization
- **Key Features**:
  - Parent-child relationships
  - SEO optimization
  - Sort ordering
  - Active/inactive status

#### `products` Table

- **Purpose**: Main product catalog
- **Key Features**:
  - Full-text search capability
  - Multiple pricing options
  - Inventory management
  - SEO optimization
  - Media management (images, videos)
  - Analytics tracking (views, favorites)
  - Review aggregation

#### `product_variants` Table

- **Purpose**: Product variations (size, color, etc.)
- **Key Features**:
  - Attribute-based variations
  - Individual pricing and inventory
  - Media overrides

### 4. Shopping Experience

#### `carts` Table

- **Purpose**: Shopping cart management
- **Key Features**:
  - Guest and user cart support
  - Automatic total calculations
  - Coupon application
  - Cart abandonment tracking

#### `cart_items` Table

- **Purpose**: Items within shopping carts
- **Key Features**:
  - Product snapshot preservation
  - Quantity management
  - Price consistency

### 5. Order Management

#### `orders` Table

- **Purpose**: Complete order lifecycle management
- **Key Features**:
  - Status tracking (pending → delivered)
  - Payment status management
  - Address management (billing/shipping)
  - Shipping integration
  - Order notes and cancellation

#### `order_items` Table

- **Purpose**: Individual items within orders
- **Key Features**:
  - Commission calculation
  - Seller amount tracking
  - Product snapshots
  - Individual item status

### 6. Payment Processing

#### `transactions` Table

- **Purpose**: Payment gateway integration
- **Key Features**:
  - Multi-gateway support (Stripe, PayPal)
  - Transaction type handling
  - Payment method details
  - Failure tracking
  - Webhook processing

### 7. Seller Payouts

#### `seller_payouts` Table

- **Purpose**: Seller payment management
- **Key Features**:
  - Period-based payouts
  - Commission deduction
  - Multiple payment methods
  - Payout status tracking

#### `payout_items` Table

- **Purpose**: Individual order items in payouts
- **Key Features**:
  - Order item linking
  - Commission breakdown
  - Audit trail

### 8. Reviews & Ratings

#### `reviews` Table

- **Purpose**: Product review system
- **Key Features**:
  - 5-star rating system
  - Review moderation
  - Verified purchase tracking
  - Media support (images)
  - Helpfulness tracking

#### `review_helpfulness` Table

- **Purpose**: Review voting system
- **Key Features**:
  - Helpful/not helpful votes
  - User vote tracking
  - Vote aggregation

### 9. Marketing & Discounts

#### `coupons` Table

- **Purpose**: Discount code management
- **Key Features**:
  - Multiple discount types
  - Usage limitations
  - Date-based validity
  - Target restrictions
  - Usage tracking

#### `coupon_usage` Table

- **Purpose**: Coupon redemption tracking
- **Key Features**:
  - Order linking
  - Usage history
  - Discount amount tracking

### 10. System Features

#### `notifications` Table

- **Purpose**: User notification system
- **Key Features**:
  - Multi-channel delivery (email, SMS, push)
  - Read status tracking
  - Action URLs
  - Notification types

#### `settings` Table

- **Purpose**: System configuration
- **Key Features**:
  - Key-value storage
  - Data type support
  - Category organization
  - Public/private settings

#### `audit_logs` Table

- **Purpose**: Complete system audit trail
- **Key Features**:
  - All table changes tracking
  - User action logging
  - IP and user agent tracking
  - JSON diff storage

## 🔍 Indexes & Performance

### Primary Indexes

- All tables use UUID primary keys
- Foreign key relationships are automatically indexed

### Composite Indexes

- Product search: `(category_id, status, price)`
- Order management: `(user_id, status, created_at)`
- Analytics: `(seller_id, created_at, status)`

### Full-Text Search

- Products table has full-text search on name, description, and tags
- GIN indexes for JSONB columns
- Search ranking and highlighting support

### Query Optimization

- Partial indexes for active records
- Covering indexes for common queries
- Efficient pagination support

## 🛡️ Security Features

### Data Protection

- Sensitive data encryption (bank details, PII)
- Password hashing with bcrypt
- SQL injection prevention via parameterized queries

### Access Control

- Role-based permissions
- Resource ownership validation
- API rate limiting support

### Audit Trail

- Complete change tracking
- User action logging
- IP address and device tracking

## 📈 Analytics Support

### Business Intelligence Views

Ready-to-use views for:

- Sales analytics
- Product performance
- Customer insights
- Seller metrics

### Reporting Queries

Pre-built queries for:

- Revenue reports
- Top products
- Customer behavior
- Commission tracking

## 🔧 Maintenance

### Automated Tasks

- Session cleanup
- Audit log rotation
- Abandoned cart cleanup
- Statistics updates

### Monitoring

- Query performance tracking
- Index usage monitoring
- Connection pool metrics
- Database health checks

## 📚 Sample Data

The seeding script creates:

- 1 Admin user
- 3 Seller accounts with profiles
- 5 Product categories
- 5 Sample products
- 3 Customer accounts
- 1 Complete order with transaction
- 2 Product reviews
- 2 Discount coupons

### Default Credentials

- **Admin**: admin@ecommerce.com / admin123
- **Seller**: techstore@example.com / seller123
- **Customer**: john.doe@example.com / customer123

## 🚀 Next Steps

1. **Initialize Database**: Run `npm run db:setup`
2. **Test Connection**: Run `npm run db:test`
3. **Start Development**: Run `npm run dev`
4. **Access API**: Visit `http://localhost:5000`

## 📖 API Documentation

With the schema in place, you can now:

- Implement user authentication endpoints
- Create product management APIs
- Build order processing workflows
- Integrate payment systems
- Set up admin dashboards

The database is designed to support all e-commerce operations while maintaining performance, security, and scalability.
