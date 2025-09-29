-- =====================================================
-- E-COMMERCE PLATFORM - COMPLETE DATABASE SCHEMA
-- PostgreSQL 15+ with Advanced Features
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- CUSTOM TYPES & ENUMS
-- =====================================================

-- User related enums
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Business related enums
CREATE TYPE business_type AS ENUM ('individual', 'sole_proprietorship', 'partnership', 'corporation', 'llc');
CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Product related enums
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'out_of_stock', 'discontinued');
CREATE TYPE product_visibility AS ENUM ('public', 'private', 'password_protected');

-- Order related enums
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'partially_refunded'
);

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'digital_wallet');

-- Transaction related enums
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'partial_refund', 'chargeback', 'fee');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled');
CREATE TYPE gateway_type AS ENUM ('stripe', 'paypal', 'square', 'razorpay');

-- Payout related enums
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled');
CREATE TYPE payout_method AS ENUM ('bank_transfer', 'paypal', 'stripe_express', 'check');

-- Review related enums
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'spam');

-- Notification related enums
CREATE TYPE notification_type AS ENUM (
    'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled',
    'payment_received', 'payout_processed', 'product_approved', 'seller_approved',
    'review_received', 'low_stock_alert', 'system_maintenance'
);

-- Coupon related enums
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y');
CREATE TYPE coupon_applicable_to AS ENUM ('all', 'specific_products', 'specific_categories', 'specific_sellers');

-- Audit related enums
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (central authentication and profile)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ,

    -- Password reset
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,

    -- Profile information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender user_gender,
    avatar_url VARCHAR(500),

    -- Role and status
    role user_role DEFAULT 'customer',
    status user_status DEFAULT 'approved',

    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,

    -- Activity tracking
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,

    -- External integrations
    stripe_customer_id VARCHAR(255),
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),

    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    marketing_emails BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT valid_name_length CHECK (LENGTH(first_name) >= 1 AND LENGTH(last_name) >= 1)
);

-- User addresses table
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Address details
    type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing, both
    is_default BOOLEAN DEFAULT FALSE,

    -- Address fields
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL, -- ISO country code

    -- Contact
    phone VARCHAR(20),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_address_type CHECK (type IN ('shipping', 'billing', 'both'))
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session details
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255),

    -- Device information
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(100),

    -- Session management
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller profiles table
CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Business information
    business_name VARCHAR(255) NOT NULL,
    business_type business_type NOT NULL,
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(50),

    -- Contact information
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    website_url VARCHAR(500),

    -- Business address
    business_address JSONB NOT NULL,

    -- Bank information (encrypted)
    bank_account_details JSONB, -- Encrypted bank details

    -- Verification
    verification_status verification_status DEFAULT 'pending',
    verification_documents JSONB, -- Array of document URLs and types
    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),

    -- Business metrics
    total_sales DECIMAL(15, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,

    -- Settings
    commission_rate DECIMAL(5, 4) DEFAULT 0.0500, -- 5% default
    auto_approve_orders BOOLEAN DEFAULT FALSE,
    vacation_mode BOOLEAN DEFAULT FALSE,
    vacation_message TEXT,

    -- Store customization
    store_logo_url VARCHAR(500),
    store_banner_url VARCHAR(500),
    store_description TEXT,
    store_policies JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table (hierarchical)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Category details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),

    -- Hierarchy
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    path TEXT, -- Materialized path for efficient queries

    -- SEO
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords VARCHAR(500),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Basic information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),

    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10, 2) CHECK (compare_price >= price),
    cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),

    -- Inventory
    sku VARCHAR(100),
    barcode VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorders BOOLEAN DEFAULT FALSE,

    -- Physical properties
    weight DECIMAL(8, 2) CHECK (weight >= 0), -- in kg
    dimensions JSONB, -- {length, width, height} in cm

    -- Media
    images JSONB, -- Array of image URLs with metadata
    video_url VARCHAR(500),

    -- Status and visibility
    status product_status DEFAULT 'draft',
    visibility product_visibility DEFAULT 'public',
    password VARCHAR(255), -- For password protected products

    -- SEO
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords VARCHAR(500),

    -- Additional data
    tags JSONB, -- Array of tags
    attributes JSONB, -- Custom attributes {color: "red", size: "large"}

    -- Analytics
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,

    -- Reviews
    average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    review_count INTEGER DEFAULT 0,

    -- Search vector for full-text search
    search_vector tsvector,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Unique constraint for seller + slug
    UNIQUE(seller_id, slug)
);

-- Product variants table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Variant details
    name VARCHAR(255) NOT NULL, -- "Red - Large"
    sku VARCHAR(100),
    barcode VARCHAR(100),

    -- Pricing override
    price DECIMAL(10, 2) CHECK (price >= 0),
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),

    -- Inventory override
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),

    -- Physical properties override
    weight DECIMAL(8, 2) CHECK (weight >= 0),
    dimensions JSONB,

    -- Media override
    image_url VARCHAR(500),

    -- Attributes
    attributes JSONB, -- {color: "red", size: "large"}

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint for product + attributes combination
    UNIQUE(product_id, attributes)
);

-- Shopping carts table
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts

    -- Cart totals (calculated fields)
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,

    -- Applied discounts
    coupon_code VARCHAR(50),

    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, abandoned, converted

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

    -- Either user_id or session_id must be present
    CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Cart items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,

    -- Item details
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),

    -- Snapshot of product details (for price consistency)
    product_snapshot JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint to prevent duplicate items
    UNIQUE(cart_id, product_id, variant_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Order identification
    order_number VARCHAR(50) NOT NULL UNIQUE DEFAULT generate_order_number(),

    -- Order status
    status order_status DEFAULT 'pending',

    -- Financial information
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),

    -- Payment information
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method DEFAULT 'card',

    -- Address information
    billing_address JSONB NOT NULL,
    shipping_address JSONB NOT NULL,

    -- Shipping information
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    tracking_url VARCHAR(500),
    estimated_delivery_date DATE,

    -- Order notes
    customer_notes TEXT,
    admin_notes TEXT,

    -- Applied coupon
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10, 2) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Cancellation details
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Item details (snapshot at time of order)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    variant_name VARCHAR(255),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),

    -- Commission calculation
    commission_rate DECIMAL(5, 4) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 0.5),
    commission_amount DECIMAL(10, 2) NOT NULL CHECK (commission_amount >= 0),
    seller_amount DECIMAL(10, 2) NOT NULL CHECK (seller_amount >= 0),

    -- Product snapshot
    product_snapshot JSONB,

    -- Item status
    status order_status DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

    -- Transaction details
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Payment gateway information
    gateway gateway_type NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_fee DECIMAL(10, 2) DEFAULT 0.00,

    -- Stripe specific fields
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_refund_id VARCHAR(255),

    -- PayPal specific fields
    paypal_order_id VARCHAR(255),
    paypal_capture_id VARCHAR(255),

    -- Payment method details
    payment_method_type VARCHAR(50),
    payment_method_details JSONB,

    -- Transaction metadata
    metadata JSONB,
    failure_reason TEXT,

    -- Processing details
    processed_by UUID REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Seller payouts table
CREATE TABLE seller_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Payout period
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,

    -- Financial information
    gross_sales DECIMAL(15, 2) NOT NULL CHECK (gross_sales >= 0),
    commission_amount DECIMAL(15, 2) NOT NULL CHECK (commission_amount >= 0),
    refund_amount DECIMAL(15, 2) DEFAULT 0.00 CHECK (refund_amount >= 0),
    adjustment_amount DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,

    -- Payout status
    status payout_status DEFAULT 'pending',

    -- Payment information
    payment_method payout_method NOT NULL,
    payment_reference VARCHAR(255),
    payment_details JSONB,

    -- Metadata
    order_count INTEGER NOT NULL CHECK (order_count >= 0),
    notes TEXT,

    -- Processing
    processed_by UUID REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Payout items table (links payouts to specific order items)
CREATE TABLE payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES seller_payouts(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,

    -- Item financial details
    item_total DECIMAL(10, 2) NOT NULL CHECK (item_total >= 0),
    commission_rate DECIMAL(5, 4) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 0.5),
    commission_amount DECIMAL(10, 2) NOT NULL CHECK (commission_amount >= 0),
    seller_amount DECIMAL(10, 2) NOT NULL CHECK (seller_amount >= 0),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint to prevent duplicate payout items
    UNIQUE(payout_id, order_item_id)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,

    -- Media
    images JSONB, -- Array of review image URLs

    -- Review status
    status review_status DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id),
    moderation_notes TEXT,

    -- Helpfulness
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    not_helpful_count INTEGER DEFAULT 0 CHECK (not_helpful_count >= 0),

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    moderated_at TIMESTAMPTZ,

    -- Prevent duplicate reviews per user per product
    UNIQUE(user_id, product_id)
);

-- Review helpfulness table
CREATE TABLE review_helpfulness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate votes
    UNIQUE(user_id, review_id)
);

-- Coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Coupon details
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Discount configuration
    type coupon_type NOT NULL,
    value DECIMAL(10, 2) NOT NULL CHECK (value >= 0),
    minimum_amount DECIMAL(10, 2) CHECK (minimum_amount >= 0),
    maximum_discount DECIMAL(10, 2) CHECK (maximum_discount >= 0),

    -- Usage limits
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_limit_per_user INTEGER DEFAULT 1 CHECK (usage_limit_per_user > 0),
    used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),

    -- Validity
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Restrictions
    applicable_to coupon_applicable_to DEFAULT 'all',
    applicable_ids JSONB, -- Array of product/category/seller IDs

    -- Creator
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validity check
    CONSTRAINT valid_dates CHECK (expires_at > starts_at)
);

-- Coupon usage table
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

    -- Usage details
    discount_amount DECIMAL(10, 2) NOT NULL CHECK (discount_amount >= 0),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate usage per order
    UNIQUE(coupon_id, order_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification content
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Notification data
    data JSONB,
    action_url VARCHAR(500),

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Delivery channels
    sent_email BOOLEAN DEFAULT FALSE,
    sent_sms BOOLEAN DEFAULT FALSE,
    sent_push BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate wishlist items
    UNIQUE(user_id, product_id)
);

-- System settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Setting details
    key_name VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    data_type VARCHAR(20) DEFAULT 'string', -- string, integer, decimal, boolean, json

    -- Metadata
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Audit details
    table_name VARCHAR(64) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,

    -- Data changes
    old_values JSONB,
    new_values JSONB,

    -- User context
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role_status ON users (role, status);
CREATE INDEX idx_users_verification_token ON users (email_verification_token);
CREATE INDEX idx_users_password_reset ON users (password_reset_token, password_reset_expires);
CREATE INDEX idx_users_stripe_customer ON users (stripe_customer_id);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_active ON users (status) WHERE deleted_at IS NULL;

-- User addresses indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses (user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses (user_id, is_default);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_token ON user_sessions (user_id, token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions (expires_at);
CREATE INDEX idx_user_sessions_last_used ON user_sessions (last_used_at);
CREATE INDEX idx_user_sessions_device_info ON user_sessions USING GIN (device_info);

-- Seller profiles indexes
CREATE INDEX idx_seller_profiles_verification_status ON seller_profiles (verification_status);
CREATE INDEX idx_seller_profiles_business_name ON seller_profiles (business_name);
CREATE INDEX idx_seller_profiles_total_sales ON seller_profiles (total_sales);
CREATE INDEX idx_seller_profiles_average_rating ON seller_profiles (average_rating);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent_level ON categories (parent_id, level);
CREATE INDEX idx_categories_active_sort ON categories (is_active, sort_order);
CREATE INDEX idx_categories_name ON categories (name);
CREATE INDEX idx_categories_path ON categories USING GIN (path gin_trgm_ops);

-- Products indexes
CREATE INDEX idx_products_seller_status ON products (seller_id, status);
CREATE INDEX idx_products_category_status ON products (category_id, status);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_stock ON products (stock_quantity);
CREATE INDEX idx_products_status_created ON products (status, created_at);
CREATE INDEX idx_products_rating ON products (average_rating);
CREATE INDEX idx_products_active ON products (deleted_at, status, created_at);
CREATE INDEX idx_products_search_vector ON products USING GIN (search_vector);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_active ON product_variants (product_id, is_active);
CREATE INDEX idx_product_variants_sku ON product_variants (sku);

-- Carts indexes
CREATE INDEX idx_carts_user_status ON carts (user_id, status);
CREATE INDEX idx_carts_session_status ON carts (session_id, status);
CREATE INDEX idx_carts_expires_at ON carts (expires_at);

-- Cart items indexes
CREATE INDEX idx_cart_items_cart_product ON cart_items (cart_id, product_id);

-- Orders indexes
CREATE INDEX idx_orders_user_status ON orders (user_id, status);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_status_created ON orders (status, created_at);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_orders_tracking ON orders (tracking_number);

-- Order items indexes
CREATE INDEX idx_order_items_order_seller ON order_items (order_id, seller_id);
CREATE INDEX idx_order_items_product_status ON order_items (product_id, status);
CREATE INDEX idx_order_items_seller_status ON order_items (seller_id, status, created_at);

-- Transactions indexes
CREATE INDEX idx_transactions_order_type ON transactions (order_id, type);
CREATE INDEX idx_transactions_gateway_transaction ON transactions (gateway, gateway_transaction_id);
CREATE INDEX idx_transactions_stripe_payment_intent ON transactions (stripe_payment_intent_id);
CREATE INDEX idx_transactions_status_created ON transactions (status, created_at);

-- Seller payouts indexes
CREATE INDEX idx_seller_payouts_seller_period ON seller_payouts (seller_id, payout_period_start, payout_period_end);
CREATE INDEX idx_seller_payouts_status_created ON seller_payouts (status, created_at);
CREATE INDEX idx_seller_payouts_payment_reference ON seller_payouts (payment_reference);

-- Payout items indexes
CREATE INDEX idx_payout_items_payout_item ON payout_items (payout_id, order_item_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product_status ON reviews (product_id, status);
CREATE INDEX idx_reviews_user_product ON reviews (user_id, product_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);
CREATE INDEX idx_reviews_status_created ON reviews (status, created_at);
CREATE INDEX idx_reviews_verified_purchase ON reviews (is_verified_purchase);

-- Review helpfulness indexes
CREATE INDEX idx_review_helpfulness_review_helpful ON review_helpfulness (review_id, is_helpful);

-- Coupons indexes
CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_active_dates ON coupons (is_active, starts_at, expires_at);
CREATE INDEX idx_coupons_type ON coupons (type);
CREATE INDEX idx_coupons_created_by ON coupons (created_by);

-- Coupon usage indexes
CREATE INDEX idx_coupon_usage_coupon_user ON coupon_usage (coupon_id, user_id);
CREATE INDEX idx_coupon_usage_order ON coupon_usage (order_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at);
CREATE INDEX idx_notifications_type ON notifications (type);

-- Wishlists indexes
CREATE INDEX idx_wishlists_user_id ON wishlists (user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists (product_id);

-- Settings indexes
CREATE INDEX idx_settings_category ON settings (category);
CREATE INDEX idx_settings_public ON settings (is_public);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_logs_user_action ON audit_logs (user_id, action, created_at);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_logs_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_payouts_updated_at BEFORE UPDATE ON seller_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-text search trigger for products
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

CREATE TRIGGER update_products_search_vector
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_vector();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active products view
CREATE VIEW active_products AS
SELECT
    p.*,
    u.first_name || ' ' || u.last_name AS seller_name,
    sp.business_name,
    c.name AS category_name
FROM products p
LEFT JOIN users u ON p.seller_id = u.id
LEFT JOIN seller_profiles sp ON u.id = sp.user_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'active' AND p.deleted_at IS NULL;

-- Order summary view
CREATE VIEW order_summary AS
SELECT
    o.*,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    COUNT(oi.id) AS item_count,
    COUNT(DISTINCT oi.seller_id) AS seller_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.first_name, u.last_name, u.email;

-- Seller dashboard view
CREATE VIEW seller_dashboard AS
SELECT
    u.id AS seller_id,
    u.first_name || ' ' || u.last_name AS seller_name,
    sp.business_name,
    sp.verification_status,
    COUNT(DISTINCT p.id) AS total_products,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) AS active_products,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    COALESCE(SUM(oi.seller_amount), 0) AS total_earnings,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS total_reviews
FROM users u
JOIN seller_profiles sp ON u.id = sp.user_id
LEFT JOIN products p ON u.id = p.seller_id AND p.deleted_at IS NULL
LEFT JOIN order_items oi ON u.id = oi.seller_id
LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
WHERE u.role = 'seller'
GROUP BY u.id, u.first_name, u.last_name, sp.business_name, sp.verification_status;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default admin user (password should be changed immediately)
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified
) VALUES (
    'admin@ecommerce.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', -- 'password123'
    'System',
    'Administrator',
    'admin',
    'approved',
    true
);

-- Insert default categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories', true),
('Clothing', 'clothing', 'Fashion and apparel', true),
('Home & Garden', 'home-garden', 'Home improvement and gardening supplies', true),
('Books', 'books', 'Books and educational materials', true),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', true);

-- Insert default settings
INSERT INTO settings (key_name, value, data_type, category, description, is_public) VALUES
('site_name', 'E-Commerce Platform', 'string', 'general', 'Website name', true),
('default_commission_rate', '5.00', 'decimal', 'financial', 'Default commission rate percentage', false),
('default_currency', 'USD', 'string', 'financial', 'Default currency code', true),
('max_upload_size', '10485760', 'integer', 'system', 'Maximum file upload size in bytes (10MB)', false),
('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode', false);

-- =====================================================
-- PERFORMANCE OPTIMIZATION QUERIES
-- =====================================================

-- Update statistics for query planner
ANALYZE;

-- Create partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_products_active_price ON products (price) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_orders_recent ON orders (created_at DESC) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX CONCURRENTLY idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE is_read = false;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Central user table for customers, sellers, and admins';
COMMENT ON TABLE seller_profiles IS 'Extended profile information for sellers';
COMMENT ON TABLE products IS 'Product catalog with full-text search capabilities';
COMMENT ON TABLE orders IS 'Customer orders with comprehensive tracking';
COMMENT ON TABLE transactions IS 'Payment transactions with gateway integration';
COMMENT ON TABLE seller_payouts IS 'Seller payment processing and tracking';
COMMENT ON TABLE audit_logs IS 'System audit trail for compliance and debugging';

COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password with salt';
COMMENT ON COLUMN products.search_vector IS 'Full-text search vector for product search';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order identifier';
COMMENT ON COLUMN order_items.commission_rate IS 'Commission rate as decimal (0.05 = 5%)';
