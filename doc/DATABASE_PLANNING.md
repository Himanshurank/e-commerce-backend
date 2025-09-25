# E-Commerce Database - PostgreSQL Planning Document

## 🎯 Project Overview

### Repository: `ecommerce-database`

**Technology**: PostgreSQL 15+ with Advanced Extensions
**Purpose**: Centralized data storage for e-commerce platform
**Deployment**: Supabase/AWS RDS/Google Cloud SQL/Neon

### Key Features

- **ACID Compliance**: Full transaction support for financial operations
- **Advanced JSON Support**: Native JSONB for flexible data structures
- **Full-Text Search**: Built-in text search with ranking and highlighting
- **Data Integrity**: Foreign key constraints and advanced validation
- **Security**: Row-level security (RLS) and role-based access control
- **Extensions**: PostGIS, pg_cron, and other powerful extensions
- **Analytics Ready**: Window functions and advanced aggregations

---

## 🏗️ Database Architecture

### Core Design Principles

#### **1. UUID Primary Keys**

```sql
-- Why UUID over auto-increment integers?
-- ✅ No collision across distributed systems
-- ✅ Security (can't guess next ID)
-- ✅ Easier database merging/sharding
-- ✅ Better for microservices architecture
-- ❌ Slightly larger storage (16 bytes vs 4/8 bytes)
-- ❌ Less human-readable

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Alternative: gen_random_uuid() in PostgreSQL 13+
    -- id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### **2. Soft Deletes Strategy**

```sql
-- Soft deletes for critical business data
-- Hard deletes for logs and temporary data

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMPTZ NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Other fields...

    -- Partial index for better performance (PostgreSQL feature)
    -- Only indexes rows where deleted_at IS NULL
    INDEX idx_active_products (status, created_at) WHERE deleted_at IS NULL
);

-- Query active products
SELECT * FROM products WHERE deleted_at IS NULL;
```

#### **3. Audit Trail Pattern**

```sql
-- Track all changes for compliance and debugging
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE');

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(64) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_user_action ON audit_logs (user_id, action, created_at);
CREATE INDEX idx_audit_created_at ON audit_logs (created_at);

-- GIN index for JSONB columns (PostgreSQL feature)
CREATE INDEX idx_audit_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_new_values ON audit_logs USING GIN (new_values);
```

---

## 📊 Complete Database Schema

### Users & Authentication

#### Users Table

```sql
-- Create custom types for better data integrity
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'customer',
    status user_status DEFAULT 'approved',

    -- Profile Information
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender user_gender,

    -- Verification & Security
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),

    -- Tracking
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,

    -- Stripe Integration
    stripe_customer_id VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- Create indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role_status ON users (role, status);
CREATE INDEX idx_users_verification_token ON users (email_verification_token);
CREATE INDEX idx_users_password_reset ON users (password_reset_token, password_reset_expires);
CREATE INDEX idx_users_stripe_customer ON users (stripe_customer_id);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_active ON users (status) WHERE deleted_at IS NULL;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### User Sessions Table

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL, -- Hashed refresh token
    device_info JSONB, -- Browser, OS, etc.
    ip_address INET,
    location VARCHAR(100), -- City, Country
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_sessions_user_token ON user_sessions (user_id, token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions (expires_at);
CREATE INDEX idx_user_sessions_last_used ON user_sessions (last_used_at);
CREATE INDEX idx_user_sessions_device_info ON user_sessions USING GIN (device_info);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Seller Profiles

#### Seller Profiles Table

```sql
CREATE TABLE seller_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,

    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    business_type ENUM('individual', 'sole_proprietorship', 'partnership', 'corporation', 'llc') NOT NULL,
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(50),

    -- Contact Information
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    website_url VARCHAR(500),

    -- Address Information
    business_address JSON NOT NULL, -- {street, city, state, postal_code, country}

    -- Bank Information (encrypted)
    bank_account_details JSON, -- Encrypted bank details

    -- Verification Documents
    documents JSON, -- Array of document URLs and types
    verification_status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
    verification_notes TEXT,
    verified_at TIMESTAMP NULL,
    verified_by CHAR(36), -- Admin user ID

    -- Business Metrics
    total_sales DECIMAL(15, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,

    -- Settings
    commission_rate DECIMAL(5, 4) DEFAULT 0.0500, -- 5% default
    auto_approve_orders BOOLEAN DEFAULT FALSE,
    vacation_mode BOOLEAN DEFAULT FALSE,
    vacation_message TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_verification_status (verification_status),
    INDEX idx_business_name (business_name),
    INDEX idx_total_sales (total_sales),
    INDEX idx_average_rating (average_rating)
);
```

### Product Catalog

#### Categories Table

```sql
CREATE TABLE categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),

    -- Hierarchy Support
    parent_id CHAR(36),
    level INT DEFAULT 0,
    sort_order INT DEFAULT 0,

    -- SEO
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords VARCHAR(500),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,

    INDEX idx_slug (slug),
    INDEX idx_parent_level (parent_id, level),
    INDEX idx_active_sort (is_active, sort_order),
    INDEX idx_name (name)
);
```

#### Products Table

```sql
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id CHAR(36) NOT NULL,
    category_id CHAR(36),

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),

    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2), -- Original price for discounts
    cost_price DECIMAL(10, 2), -- For profit calculations

    -- Inventory
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorders BOOLEAN DEFAULT FALSE,

    -- Physical Properties
    weight DECIMAL(8, 2), -- in kg
    dimensions JSON, -- {length, width, height} in cm

    -- Media
    images JSON, -- Array of image URLs
    video_url VARCHAR(500),

    -- Status & Visibility
    status ENUM('draft', 'active', 'inactive', 'out_of_stock') DEFAULT 'draft',
    visibility ENUM('public', 'private', 'password_protected') DEFAULT 'public',
    password VARCHAR(255), -- For password protected products

    -- SEO
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords VARCHAR(500),

    -- Additional Data
    tags JSON, -- Array of tags
    attributes JSON, -- Custom attributes {color: "red", size: "large"}
    variants JSON, -- Product variants

    -- Analytics
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,

    -- Reviews
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

    -- Indexes for Performance
    INDEX idx_seller_status (seller_id, status),
    INDEX idx_category_status (category_id, status),
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_price (price),
    INDEX idx_stock (stock_quantity),
    INDEX idx_status_created (status, created_at),
    INDEX idx_rating (average_rating),
    INDEX idx_active_products (deleted_at, status, created_at),

    -- Full-text search
    FULLTEXT idx_search (name, description, short_description, tags)
);
```

#### Product Variants Table

```sql
CREATE TABLE product_variants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,

    -- Variant Details
    name VARCHAR(255) NOT NULL, -- "Red - Large"
    sku VARCHAR(100) UNIQUE,

    -- Pricing Override
    price DECIMAL(10, 2),
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),

    -- Inventory Override
    stock_quantity INT DEFAULT 0,

    -- Physical Properties Override
    weight DECIMAL(8, 2),
    dimensions JSON,

    -- Media Override
    image_url VARCHAR(500),

    -- Attributes
    attributes JSON, -- {color: "red", size: "large"}

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

    INDEX idx_product_active (product_id, is_active),
    INDEX idx_sku (sku)
);
```

### Shopping Cart

#### Carts Table

```sql
CREATE TABLE carts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36), -- NULL for guest carts
    session_id VARCHAR(255), -- For guest carts

    -- Cart Totals (calculated fields)
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,

    -- Applied Discounts
    coupon_code VARCHAR(50),

    -- Status
    status ENUM('active', 'abandoned', 'converted') DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- For cleanup

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user_status (user_id, status),
    INDEX idx_session_status (session_id, status),
    INDEX idx_expires_at (expires_at)
);
```

#### Cart Items Table

```sql
CREATE TABLE cart_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cart_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36), -- If product has variants

    -- Item Details
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,

    -- Snapshot of product details (for price consistency)
    product_snapshot JSON, -- Product details at time of adding

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,

    INDEX idx_cart_product (cart_id, product_id),
    UNIQUE KEY unique_cart_product_variant (cart_id, product_id, variant_id)
);
```

### Orders & Transactions

#### Orders Table

```sql
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,

    -- Order Identification
    order_number VARCHAR(50) NOT NULL UNIQUE,

    -- Order Status
    status ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'partially_refunded'
    ) DEFAULT 'pending',

    -- Financial Information
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Payment Information
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_method ENUM('card', 'paypal', 'bank_transfer', 'cash_on_delivery') DEFAULT 'card',

    -- Address Information
    billing_address JSON NOT NULL,
    shipping_address JSON NOT NULL,

    -- Shipping Information
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    tracking_url VARCHAR(500),
    estimated_delivery_date DATE,

    -- Order Notes
    customer_notes TEXT,
    admin_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,

    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by CHAR(36), -- User ID who cancelled

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_user_status (user_id, status),
    INDEX idx_order_number (order_number),
    INDEX idx_status_created (status, created_at),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    INDEX idx_tracking (tracking_number)
);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    seller_id CHAR(36) NOT NULL,

    -- Item Details
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    variant_name VARCHAR(255),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,

    -- Commission Calculation
    commission_rate DECIMAL(5, 4) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    seller_amount DECIMAL(10, 2) NOT NULL,

    -- Product Snapshot
    product_snapshot JSON, -- Full product details at time of order

    -- Item Status
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_order_seller (order_id, seller_id),
    INDEX idx_product_status (product_id, status),
    INDEX idx_seller_status (seller_id, status, created_at)
);
```

#### Transactions Table

```sql
CREATE TABLE transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,

    -- Transaction Details
    type ENUM('payment', 'refund', 'partial_refund', 'chargeback') NOT NULL,
    status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled') DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Payment Gateway Information
    gateway ENUM('stripe', 'paypal', 'square') NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_fee DECIMAL(10, 2) DEFAULT 0.00,

    -- Stripe Specific
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),

    -- Payment Method Details
    payment_method_type VARCHAR(50), -- card, bank_account, etc.
    payment_method_details JSON, -- {last4, brand, etc.}

    -- Transaction Metadata
    metadata JSON,
    failure_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,

    INDEX idx_order_type (order_id, type),
    INDEX idx_gateway_transaction (gateway, gateway_transaction_id),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_status_created (status, created_at)
);
```

### Seller Payouts

#### Seller Payouts Table

```sql
CREATE TABLE seller_payouts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id CHAR(36) NOT NULL,

    -- Payout Details
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,

    -- Financial Information
    gross_sales DECIMAL(15, 2) NOT NULL,
    commission_amount DECIMAL(15, 2) NOT NULL,
    refund_amount DECIMAL(15, 2) DEFAULT 0.00,
    adjustment_amount DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,

    -- Payout Status
    status ENUM('pending', 'processing', 'paid', 'failed', 'cancelled') DEFAULT 'pending',

    -- Payment Information
    payment_method ENUM('bank_transfer', 'paypal', 'stripe_express') NOT NULL,
    payment_reference VARCHAR(255),
    payment_details JSON,

    -- Metadata
    order_count INT NOT NULL,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,

    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_seller_period (seller_id, payout_period_start, payout_period_end),
    INDEX idx_status_created (status, created_at),
    INDEX idx_payment_reference (payment_reference)
);
```

#### Payout Items Table

```sql
CREATE TABLE payout_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payout_id CHAR(36) NOT NULL,
    order_item_id CHAR(36) NOT NULL,

    -- Item Financial Details
    item_total DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    seller_amount DECIMAL(10, 2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (payout_id) REFERENCES seller_payouts(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE RESTRICT,

    INDEX idx_payout_item (payout_id, order_item_id),
    UNIQUE KEY unique_payout_order_item (payout_id, order_item_id)
);
```

### Reviews & Ratings

#### Reviews Table

```sql
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    order_item_id CHAR(36), -- Link to purchased item

    -- Review Content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,

    -- Media
    images JSON, -- Array of review image URLs

    -- Review Status
    status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
    moderated_by CHAR(36),
    moderation_notes TEXT,

    -- Helpfulness
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP NULL,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_product_status (product_id, status),
    INDEX idx_user_product (user_id, product_id),
    INDEX idx_rating (rating),
    INDEX idx_status_created (status, created_at),
    INDEX idx_verified_purchase (is_verified_purchase),

    -- Prevent duplicate reviews per user per product
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);
```

#### Review Helpfulness Table

```sql
CREATE TABLE review_helpfulness (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    review_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    is_helpful BOOLEAN NOT NULL, -- TRUE for helpful, FALSE for not helpful
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY unique_user_review_vote (user_id, review_id),
    INDEX idx_review_helpful (review_id, is_helpful)
);
```

### Coupons & Discounts

#### Coupons Table

```sql
CREATE TABLE coupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    -- Coupon Details
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Discount Configuration
    type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    value DECIMAL(10, 2) NOT NULL, -- Percentage (0-100) or fixed amount
    minimum_amount DECIMAL(10, 2), -- Minimum order amount
    maximum_discount DECIMAL(10, 2), -- Maximum discount for percentage coupons

    -- Usage Limits
    usage_limit INT, -- Total usage limit
    usage_limit_per_user INT DEFAULT 1,
    used_count INT DEFAULT 0,

    -- Validity
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Restrictions
    applicable_to ENUM('all', 'specific_products', 'specific_categories', 'specific_sellers') DEFAULT 'all',
    applicable_ids JSON, -- Array of product/category/seller IDs

    -- Creator
    created_by CHAR(36) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_code (code),
    INDEX idx_active_dates (is_active, starts_at, expires_at),
    INDEX idx_type (type),
    INDEX idx_created_by (created_by)
);
```

#### Coupon Usage Table

```sql
CREATE TABLE coupon_usage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    coupon_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,

    -- Usage Details
    discount_amount DECIMAL(10, 2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,

    INDEX idx_coupon_user (coupon_id, user_id),
    INDEX idx_order (order_id),
    UNIQUE KEY unique_coupon_order (coupon_id, order_id)
);
```

### Notifications & Communications

#### Notifications Table

```sql
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,

    -- Notification Content
    type VARCHAR(50) NOT NULL, -- 'order_confirmed', 'product_shipped', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Notification Data
    data JSON, -- Additional data for the notification
    action_url VARCHAR(500), -- URL to redirect when clicked

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,

    -- Delivery Channels
    sent_email BOOLEAN DEFAULT FALSE,
    sent_sms BOOLEAN DEFAULT FALSE,
    sent_push BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user_read (user_id, is_read),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_type (type)
);
```

### System Configuration

#### Settings Table

```sql
CREATE TABLE settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    -- Setting Details
    key_name VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    data_type ENUM('string', 'integer', 'decimal', 'boolean', 'json') DEFAULT 'string',

    -- Metadata
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_public (is_public)
);
```

---

## 🔧 Database Optimization

### Indexing Strategy

#### **1. Primary Indexes (Already Defined)**

```sql
-- All tables have UUID primary keys with proper indexing
-- Foreign key relationships are indexed automatically
```

#### **2. Composite Indexes for Common Queries**

```sql
-- Product search and filtering
ALTER TABLE products
ADD INDEX idx_category_status_price (category_id, status, price),
ADD INDEX idx_seller_status_created (seller_id, status, created_at),
ADD INDEX idx_status_rating_created (status, average_rating, created_at);

-- Order management
ALTER TABLE orders
ADD INDEX idx_user_status_created (user_id, status, created_at),
ADD INDEX idx_status_payment_created (status, payment_status, created_at);

-- Analytics queries
ALTER TABLE order_items
ADD INDEX idx_seller_created_status (seller_id, created_at, status),
ADD INDEX idx_product_created_status (product_id, created_at, status);
```

#### **3. Full-Text Search Optimization**

```sql
-- Add tsvector column for full-text search (PostgreSQL feature)
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, '{}'), ' ')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_products_search_vector
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX idx_products_search_vector ON products USING GIN (search_vector);

-- Update existing records
UPDATE products SET search_vector =
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(tags, '{}'), ' ')), 'D');

-- Search with relevance ranking
SELECT
    *,
    ts_rank(search_vector, plainto_tsquery('english', $1)) as relevance
FROM products
WHERE search_vector @@ plainto_tsquery('english', $1)
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY relevance DESC, average_rating DESC
LIMIT 20;

-- Advanced search with highlighting
SELECT
    *,
    ts_rank(search_vector, query) as relevance,
    ts_headline('english', name, query, 'MaxWords=10, MinWords=1') as highlighted_name,
    ts_headline('english', description, query, 'MaxWords=20, MinWords=5') as highlighted_description
FROM products, plainto_tsquery('english', $1) as query
WHERE search_vector @@ query
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY relevance DESC
LIMIT 20;
```

### Query Performance Patterns

#### **1. Efficient Product Listing**

```sql
-- Paginated product listing with filters
SELECT p.*, u.name as seller_name, c.name as category_name
FROM products p
LEFT JOIN users u ON p.seller_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'active'
  AND p.deleted_at IS NULL
  AND (p.category_id = ? OR ? IS NULL)
  AND p.price BETWEEN ? AND ?
ORDER BY p.created_at DESC
LIMIT ? OFFSET ?;

-- Count query for pagination
SELECT COUNT(*)
FROM products p
WHERE p.status = 'active'
  AND p.deleted_at IS NULL
  AND (p.category_id = ? OR ? IS NULL)
  AND p.price BETWEEN ? AND ?;
```

#### **2. Order Analytics for Sellers**

```sql
-- Seller dashboard analytics
SELECT
    DATE(oi.created_at) as order_date,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity) as items_sold,
    SUM(oi.seller_amount) as revenue
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE oi.seller_id = ?
  AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
  AND oi.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(oi.created_at)
ORDER BY order_date DESC;
```

#### **3. Product Recommendations**

```sql
-- Related products based on category and ratings
SELECT p.*, AVG(r.rating) as avg_rating
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
WHERE p.category_id = (SELECT category_id FROM products WHERE id = ?)
  AND p.id != ?
  AND p.status = 'active'
  AND p.deleted_at IS NULL
GROUP BY p.id
ORDER BY avg_rating DESC, p.view_count DESC
LIMIT 8;
```

---

## 🔒 Security & Data Protection

### Data Encryption Strategy

#### **1. Sensitive Data Encryption**

```sql
-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive fields at application level
-- Bank account details, SSNs, etc.

-- Example: Encrypted bank details in seller_profiles
UPDATE seller_profiles
SET bank_account_details = pgp_sym_encrypt(
    jsonb_build_object(
        'account_number', '****1234',
        'routing_number', '****5678',
        'bank_name', 'Example Bank'
    )::text,
    'encryption_key'
)::jsonb
WHERE id = $1;

-- Decrypt data when needed
SELECT
    id,
    business_name,
    pgp_sym_decrypt(bank_account_details::text, 'encryption_key')::jsonb as decrypted_bank_details
FROM seller_profiles
WHERE id = $1;
```

#### **2. PII Data Handling**

```sql
-- Create view for safe user data access
CREATE VIEW users_safe AS
SELECT
    id,
    email,
    name,
    role,
    status,
    avatar_url,
    email_verified,
    created_at,
    updated_at
FROM users
WHERE deleted_at IS NULL;
```

### Access Control

#### **1. Database User Roles**

```sql
-- Application user (read/write for app operations)
CREATE USER ecommerce_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ecommerce TO ecommerce_app;
GRANT USAGE ON SCHEMA public TO ecommerce_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ecommerce_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ecommerce_app;

-- Analytics user (read-only for reporting)
CREATE USER ecommerce_analytics WITH PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE ecommerce TO ecommerce_analytics;
GRANT USAGE ON SCHEMA public TO ecommerce_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecommerce_analytics;

-- Backup user (for automated backups)
CREATE USER ecommerce_backup WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE ecommerce TO ecommerce_backup;
GRANT USAGE ON SCHEMA public TO ecommerce_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecommerce_backup;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ecommerce_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ecommerce_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecommerce_analytics;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecommerce_backup;
```

#### **2. Row-Level Security Patterns**

```sql
-- Sellers can only access their own data
-- Implemented at application level with WHERE clauses

-- Example: Seller product access
SELECT * FROM products
WHERE seller_id = ? AND deleted_at IS NULL;

-- Example: User order access
SELECT * FROM orders
WHERE user_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin');
```

---

## 📊 Analytics & Reporting

### Business Intelligence Views

#### **1. Sales Analytics View**

```sql
CREATE VIEW sales_analytics AS
SELECT
    DATE(o.created_at) as sale_date,
    YEAR(o.created_at) as sale_year,
    MONTH(o.created_at) as sale_month,
    DAY(o.created_at) as sale_day,
    DAYNAME(o.created_at) as day_name,

    -- Order metrics
    COUNT(DISTINCT o.id) as order_count,
    SUM(o.total_amount) as gross_revenue,
    SUM(o.total_amount - o.tax_amount - o.shipping_amount) as net_revenue,
    AVG(o.total_amount) as average_order_value,

    -- Item metrics
    SUM(oi.quantity) as items_sold,
    COUNT(DISTINCT oi.product_id) as unique_products_sold,
    COUNT(DISTINCT o.user_id) as unique_customers,

    -- Commission metrics
    SUM(oi.commission_amount) as total_commission,
    SUM(oi.seller_amount) as total_seller_payout

FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
GROUP BY DATE(o.created_at);
```

#### **2. Product Performance View**

```sql
CREATE VIEW product_performance AS
SELECT
    p.id,
    p.name,
    p.seller_id,
    u.name as seller_name,
    p.category_id,
    c.name as category_name,

    -- Sales metrics
    COALESCE(sales.total_quantity, 0) as total_sold,
    COALESCE(sales.total_revenue, 0) as total_revenue,
    COALESCE(sales.order_count, 0) as order_count,

    -- Inventory metrics
    p.stock_quantity,
    p.view_count,

    -- Review metrics
    p.average_rating,
    p.review_count,

    -- Performance ratios
    CASE
        WHEN p.view_count > 0
        THEN COALESCE(sales.order_count, 0) / p.view_count * 100
        ELSE 0
    END as conversion_rate

FROM products p
LEFT JOIN users u ON p.seller_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN (
    SELECT
        oi.product_id,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    GROUP BY oi.product_id
) sales ON p.id = sales.product_id
WHERE p.deleted_at IS NULL;
```

### Reporting Queries

#### **1. Monthly Revenue Report**

```sql
SELECT
    DATE_FORMAT(sale_date, '%Y-%m') as month,
    SUM(gross_revenue) as monthly_revenue,
    SUM(order_count) as monthly_orders,
    AVG(average_order_value) as avg_order_value,
    SUM(unique_customers) as total_customers
FROM sales_analytics
WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month DESC;
```

#### **2. Top Performing Products**

```sql
SELECT
    name,
    seller_name,
    category_name,
    total_sold,
    total_revenue,
    average_rating,
    conversion_rate
FROM product_performance
WHERE total_sold > 0
ORDER BY total_revenue DESC
LIMIT 20;
```

---

## 🚀 Deployment & Maintenance

### Database Configuration

#### **1. PostgreSQL Configuration (postgresql.conf)**

```ini
# Connection Settings
max_connections = 200
shared_buffers = 2GB                    # 25% of RAM
effective_cache_size = 6GB              # 75% of RAM
work_mem = 16MB                         # Per connection
maintenance_work_mem = 512MB

# Write-Ahead Logging (WAL)
wal_buffers = 64MB
checkpoint_completion_target = 0.9
wal_writer_delay = 200ms
commit_delay = 0

# Query Planner
random_page_cost = 1.1                  # For SSD storage
effective_io_concurrency = 200          # For SSD storage

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000       # Log slow queries (1 second)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Autovacuum
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

#### **2. Environment-Specific Settings**

**Development Environment:**

```sql
-- Relaxed settings for development
ALTER SYSTEM SET synchronous_commit = 'off';
ALTER SYSTEM SET fsync = 'off';
ALTER SYSTEM SET full_page_writes = 'off';
SELECT pg_reload_conf();
```

**Production Environment:**

```sql
-- Strict settings for production
ALTER SYSTEM SET synchronous_commit = 'on';
ALTER SYSTEM SET fsync = 'on';
ALTER SYSTEM SET full_page_writes = 'on';
ALTER SYSTEM SET wal_level = 'replica';
SELECT pg_reload_conf();
```

### Backup Strategy

#### **1. Automated Backup Script**

```bash
#!/bin/bash
# backup_ecommerce.sh

DB_NAME="ecommerce"
DB_USER="ecommerce_backup"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup with pg_dump
PGPASSWORD=$DB_PASS pg_dump \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --format=custom \
  --compress=9 \
  --verbose \
  --file=$BACKUP_DIR/ecommerce_full_$DATE.dump

# Also create a plain SQL backup for easier inspection
PGPASSWORD=$DB_PASS pg_dump \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --format=plain \
  --verbose \
  --file=$BACKUP_DIR/ecommerce_full_$DATE.sql

# Compress SQL backup
gzip $BACKUP_DIR/ecommerce_full_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "ecommerce_full_*" -mtime +30 -delete

echo "Backup completed: ecommerce_full_$DATE.dump"
```

#### **2. Point-in-Time Recovery Setup**

```sql
-- Enable WAL archiving for point-in-time recovery
-- In postgresql.conf:
-- wal_level = replica
-- archive_mode = on
-- archive_command = 'cp %p /backup/wal_archive/%f'

-- Create recovery script template
-- 1. Restore from last full backup using pg_restore
-- 2. Apply WAL files from backup time to desired recovery point

-- Example recovery commands:
-- pg_restore --host=localhost --port=5432 --username=postgres --dbname=ecommerce_recovery --verbose /backups/postgresql/ecommerce_full_20231201_120000.dump
```

### Monitoring & Maintenance

#### **1. Performance Monitoring Queries**

```sql
-- Check slow queries (requires pg_stat_statements extension)
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;

-- Check database connections
SELECT
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database
WHERE datname = 'ecommerce';
```

#### **2. Maintenance Tasks**

```sql
-- Weekly maintenance script

-- Update table statistics (PostgreSQL equivalent of ANALYZE)
ANALYZE products, orders, order_items, users;

-- Vacuum tables to reclaim space and update statistics
VACUUM ANALYZE products;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;
VACUUM ANALYZE users;

-- Reindex tables if needed (usually not necessary with autovacuum)
-- REINDEX TABLE products;

-- Clean up expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Clean up old audit logs (keep 1 year)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- Clean up abandoned carts (older than 30 days)
DELETE FROM carts WHERE status = 'abandoned' AND updated_at < NOW() - INTERVAL '30 days';

-- Update sequence values if needed (PostgreSQL specific)
-- SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
```

---

## 📚 Learning Outcomes

### Technical Skills You'll Master

#### **Database Design Principles**

- **Why Important**: Foundation for scalable applications
- **What You'll Learn**:
  - Normalization vs denormalization trade-offs
  - UUID vs auto-increment primary keys
  - Composite indexing strategies
  - JSON column usage and optimization

#### **Performance Optimization**

- **Why Important**: Critical for user experience and costs
- **What You'll Learn**:
  - Query optimization techniques
  - Index design and maintenance
  - Full-text search implementation
  - Database monitoring and profiling

#### **Data Security & Compliance**

- **Why Important**: Legal requirements and user trust
- **What You'll Learn**:
  - Encryption at rest and in transit
  - Access control patterns
  - PII data handling
  - Audit trail implementation

#### **Business Intelligence**

- **Why Important**: Data-driven decision making
- **What You'll Learn**:
  - Analytics view design
  - Reporting query optimization
  - Time-series data handling
  - KPI calculation methods

#### **Production Database Management**

- **Why Important**: Reliability and disaster recovery
- **What You'll Learn**:
  - Backup and recovery strategies
  - Database monitoring
  - Performance tuning
  - Maintenance automation

This database planning document provides a complete foundation for building a robust, scalable e-commerce database. Every table, index, and query is designed with performance, security, and maintainability in mind.

The schema supports complex e-commerce operations while maintaining data integrity and providing the flexibility needed for future growth! 🚀
