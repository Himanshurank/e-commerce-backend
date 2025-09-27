import dotenv from "dotenv";
import { DatabaseFactory } from "../shared/factories/databaseFactory";
import { EConnectionTypes } from "../shared/infrastructure/config/database";

// Load environment variables
dotenv.config();

async function initializeDatabaseSchema() {
  console.log("🔄 Initializing e-commerce database schema...");

  try {
    const mainDb = DatabaseFactory.getDatabase(EConnectionTypes.main);

    // 1. Create PostgreSQL Extensions and Functions
    console.log("📦 Creating PostgreSQL extensions and functions...");
    await createExtensionsAndFunctions(mainDb);

    // 2. Create Custom Types
    console.log("🏷️  Creating custom types...");
    await createCustomTypes(mainDb);

    // 3. Create Users and Authentication Tables
    console.log("👤 Creating users and authentication tables...");
    await createUsersAndAuthTables(mainDb);

    // 4. Create Seller Profile Tables
    console.log("🏪 Creating seller profile tables...");
    await createSellerTables(mainDb);

    // 5. Create Product Catalog Tables
    console.log("📦 Creating product catalog tables...");
    await createProductTables(mainDb);

    // 6. Create Shopping Cart Tables
    console.log("🛒 Creating shopping cart tables...");
    await createCartTables(mainDb);

    // 7. Create Order and Transaction Tables
    console.log("📋 Creating order and transaction tables...");
    await createOrderTables(mainDb);

    // 8. Create Seller Payout Tables
    console.log("💰 Creating seller payout tables...");
    await createPayoutTables(mainDb);

    // 9. Create Review and Rating Tables
    console.log("⭐ Creating review and rating tables...");
    await createReviewTables(mainDb);

    // 10. Create Coupon and Discount Tables
    console.log("🎫 Creating coupon and discount tables...");
    await createCouponTables(mainDb);

    // 11. Create Notification Tables
    console.log("🔔 Creating notification tables...");
    await createNotificationTables(mainDb);

    // 12. Create System Configuration Tables
    console.log("⚙️  Creating system configuration tables...");
    await createSystemTables(mainDb);

    // 13. Create Audit Log Table
    console.log("📝 Creating audit log table...");
    await createAuditTables(mainDb);

    // 14. Create Performance Indexes
    console.log("🚀 Creating performance indexes...");
    await createPerformanceIndexes(mainDb);

    console.log("✅ Database schema initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database schema initialization failed:", error);
    throw error;
  } finally {
    await DatabaseFactory.closeAllConnections();
  }
}

async function createExtensionsAndFunctions(db: any) {
  // Enable UUID extension
  await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // Enable pgcrypto for encryption
  await db.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Create updated_at trigger function
  await db.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);
}

async function createCustomTypes(db: any) {
  // User-related types
  await db.query(
    `CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');`
  );
  await db.query(
    `CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');`
  );
  await db.query(
    `CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');`
  );

  // Business types
  await db.query(
    `CREATE TYPE business_type AS ENUM ('individual', 'sole_proprietorship', 'partnership', 'corporation', 'llc');`
  );
  await db.query(
    `CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');`
  );

  // Product types
  await db.query(
    `CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'out_of_stock');`
  );
  await db.query(
    `CREATE TYPE product_visibility AS ENUM ('public', 'private', 'password_protected');`
  );

  // Order types
  await db.query(
    `CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded');`
  );
  await db.query(
    `CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');`
  );
  await db.query(
    `CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'bank_transfer', 'cash_on_delivery');`
  );

  // Transaction types
  await db.query(
    `CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'partial_refund', 'chargeback');`
  );
  await db.query(
    `CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled');`
  );
  await db.query(
    `CREATE TYPE payment_gateway AS ENUM ('stripe', 'paypal', 'square');`
  );

  // Payout types
  await db.query(
    `CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled');`
  );
  await db.query(
    `CREATE TYPE payout_method AS ENUM ('bank_transfer', 'paypal', 'stripe_express');`
  );

  // Review types
  await db.query(
    `CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'spam');`
  );

  // Coupon types
  await db.query(
    `CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');`
  );
  await db.query(
    `CREATE TYPE coupon_applicable_to AS ENUM ('all', 'specific_products', 'specific_categories', 'specific_sellers');`
  );

  // Cart types
  await db.query(
    `CREATE TYPE cart_status AS ENUM ('active', 'abandoned', 'converted');`
  );

  // Audit types
  await db.query(
    `CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE');`
  );
}

async function createUsersAndAuthTables(db: any) {
  // Users table
  await db.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
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
      CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
      CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\\+?[1-9]\\d{1,14}$')
    );
  `);

  // User sessions table
  await db.query(`
    CREATE TABLE user_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      device_info JSONB,
      ip_address INET,
      location VARCHAR(100),
      expires_at TIMESTAMPTZ NOT NULL,
      last_used_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes for users
  await db.query(`CREATE INDEX idx_users_email ON users (email);`);
  await db.query(`CREATE INDEX idx_users_role_status ON users (role, status);`);
  await db.query(
    `CREATE INDEX idx_users_verification_token ON users (email_verification_token);`
  );
  await db.query(
    `CREATE INDEX idx_users_password_reset ON users (password_reset_token, password_reset_expires);`
  );
  await db.query(
    `CREATE INDEX idx_users_stripe_customer ON users (stripe_customer_id);`
  );
  await db.query(`CREATE INDEX idx_users_created_at ON users (created_at);`);
  await db.query(
    `CREATE INDEX idx_users_active ON users (status) WHERE deleted_at IS NULL;`
  );

  // Create indexes for user_sessions
  await db.query(
    `CREATE INDEX idx_user_sessions_user_token ON user_sessions (user_id, token_hash);`
  );
  await db.query(
    `CREATE INDEX idx_user_sessions_expires_at ON user_sessions (expires_at);`
  );
  await db.query(
    `CREATE INDEX idx_user_sessions_last_used ON user_sessions (last_used_at);`
  );
  await db.query(
    `CREATE INDEX idx_user_sessions_device_info ON user_sessions USING GIN (device_info);`
  );

  // Create triggers
  await db.query(`
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await db.query(`
    CREATE TRIGGER update_user_sessions_updated_at
      BEFORE UPDATE ON user_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createSellerTables(db: any) {
  // Seller profiles table
  await db.query(`
    CREATE TABLE seller_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

      -- Business Information
      business_name VARCHAR(255) NOT NULL,
      business_type business_type NOT NULL,
      business_registration_number VARCHAR(100),
      tax_id VARCHAR(50),

      -- Contact Information
      business_email VARCHAR(255),
      business_phone VARCHAR(20),
      website_url VARCHAR(500),

      -- Address Information
      business_address JSONB NOT NULL,

      -- Bank Information (encrypted)
      bank_account_details JSONB,

      -- Verification Documents
      documents JSONB,
      verification_status verification_status DEFAULT 'pending',
      verification_notes TEXT,
      verified_at TIMESTAMPTZ NULL,
      verified_by UUID REFERENCES users(id) ON DELETE SET NULL,

      -- Business Metrics
      total_sales DECIMAL(15, 2) DEFAULT 0.00,
      total_orders INTEGER DEFAULT 0,
      average_rating DECIMAL(3, 2) DEFAULT 0.00,
      rating_count INTEGER DEFAULT 0,

      -- Settings
      commission_rate DECIMAL(5, 4) DEFAULT 0.0500,
      auto_approve_orders BOOLEAN DEFAULT FALSE,
      vacation_mode BOOLEAN DEFAULT FALSE,
      vacation_message TEXT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes for seller_profiles
  await db.query(
    `CREATE INDEX idx_seller_verification_status ON seller_profiles (verification_status);`
  );
  await db.query(
    `CREATE INDEX idx_seller_business_name ON seller_profiles (business_name);`
  );
  await db.query(
    `CREATE INDEX idx_seller_total_sales ON seller_profiles (total_sales);`
  );
  await db.query(
    `CREATE INDEX idx_seller_average_rating ON seller_profiles (average_rating);`
  );

  // Create trigger
  await db.query(`
    CREATE TRIGGER update_seller_profiles_updated_at
      BEFORE UPDATE ON seller_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createProductTables(db: any) {
  // Categories table
  await db.query(`
    CREATE TABLE categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      image_url VARCHAR(500),

      -- Hierarchy Support
      parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      level INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,

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
  `);

  // Products table
  await db.query(`
    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

      -- Basic Information
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      short_description VARCHAR(500),

      -- Pricing
      price DECIMAL(10, 2) NOT NULL,
      compare_price DECIMAL(10, 2),
      cost_price DECIMAL(10, 2),

      -- Inventory
      sku VARCHAR(100) UNIQUE,
      stock_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      track_inventory BOOLEAN DEFAULT TRUE,
      allow_backorders BOOLEAN DEFAULT FALSE,

      -- Physical Properties
      weight DECIMAL(8, 2),
      dimensions JSONB,

      -- Media
      images JSONB,
      video_url VARCHAR(500),

      -- Status & Visibility
      status product_status DEFAULT 'draft',
      visibility product_visibility DEFAULT 'public',
      password VARCHAR(255),

      -- SEO
      seo_title VARCHAR(255),
      seo_description VARCHAR(500),
      seo_keywords VARCHAR(500),

      -- Additional Data
      tags JSONB,
      attributes JSONB,
      variants JSONB,

      -- Analytics
      view_count INTEGER DEFAULT 0,
      favorite_count INTEGER DEFAULT 0,

      -- Reviews
      average_rating DECIMAL(3, 2) DEFAULT 0.00,
      review_count INTEGER DEFAULT 0,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
  `);

  // Product variants table
  await db.query(`
    CREATE TABLE product_variants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

      -- Variant Details
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) UNIQUE,

      -- Pricing Override
      price DECIMAL(10, 2),
      compare_price DECIMAL(10, 2),
      cost_price DECIMAL(10, 2),

      -- Inventory Override
      stock_quantity INTEGER DEFAULT 0,

      -- Physical Properties Override
      weight DECIMAL(8, 2),
      dimensions JSONB,

      -- Media Override
      image_url VARCHAR(500),

      -- Attributes
      attributes JSONB,

      -- Status
      is_active BOOLEAN DEFAULT TRUE,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes for categories
  await db.query(`CREATE INDEX idx_categories_slug ON categories (slug);`);
  await db.query(
    `CREATE INDEX idx_categories_parent_level ON categories (parent_id, level);`
  );
  await db.query(
    `CREATE INDEX idx_categories_active_sort ON categories (is_active, sort_order);`
  );
  await db.query(`CREATE INDEX idx_categories_name ON categories (name);`);

  // Create indexes for products
  await db.query(
    `CREATE INDEX idx_products_seller_status ON products (seller_id, status);`
  );
  await db.query(
    `CREATE INDEX idx_products_category_status ON products (category_id, status);`
  );
  await db.query(`CREATE INDEX idx_products_slug ON products (slug);`);
  await db.query(`CREATE INDEX idx_products_sku ON products (sku);`);
  await db.query(`CREATE INDEX idx_products_price ON products (price);`);
  await db.query(
    `CREATE INDEX idx_products_stock ON products (stock_quantity);`
  );
  await db.query(
    `CREATE INDEX idx_products_status_created ON products (status, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_products_rating ON products (average_rating);`
  );
  await db.query(
    `CREATE INDEX idx_products_active ON products (deleted_at, status, created_at);`
  );

  // Create indexes for product_variants
  await db.query(
    `CREATE INDEX idx_product_variants_product_active ON product_variants (product_id, is_active);`
  );
  await db.query(
    `CREATE INDEX idx_product_variants_sku ON product_variants (sku);`
  );

  // Create triggers
  await db.query(`
    CREATE TRIGGER update_categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await db.query(`
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await db.query(`
    CREATE TRIGGER update_product_variants_updated_at
      BEFORE UPDATE ON product_variants
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createCartTables(db: any) {
  // Carts table
  await db.query(`
    CREATE TABLE carts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      session_id VARCHAR(255),

      -- Cart Totals (calculated fields)
      subtotal DECIMAL(10, 2) DEFAULT 0.00,
      tax_amount DECIMAL(10, 2) DEFAULT 0.00,
      shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
      discount_amount DECIMAL(10, 2) DEFAULT 0.00,
      total_amount DECIMAL(10, 2) DEFAULT 0.00,

      -- Applied Discounts
      coupon_code VARCHAR(50),

      -- Status
      status cart_status DEFAULT 'active',

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    );
  `);

  // Cart items table
  await db.query(`
    CREATE TABLE cart_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,

      -- Item Details
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,

      -- Snapshot of product details (for price consistency)
      product_snapshot JSONB,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      -- Constraints
      UNIQUE (cart_id, product_id, variant_id)
    );
  `);

  // Create indexes for carts
  await db.query(
    `CREATE INDEX idx_carts_user_status ON carts (user_id, status);`
  );
  await db.query(
    `CREATE INDEX idx_carts_session_status ON carts (session_id, status);`
  );
  await db.query(`CREATE INDEX idx_carts_expires_at ON carts (expires_at);`);

  // Create indexes for cart_items
  await db.query(
    `CREATE INDEX idx_cart_items_cart_product ON cart_items (cart_id, product_id);`
  );

  // Create triggers
  await db.query(`
    CREATE TRIGGER update_carts_updated_at
      BEFORE UPDATE ON carts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await db.query(`
    CREATE TRIGGER update_cart_items_updated_at
      BEFORE UPDATE ON cart_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createOrderTables(db: any) {
  // Orders table
  await db.query(`
    CREATE TABLE orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

      -- Order Identification
      order_number VARCHAR(50) NOT NULL UNIQUE,

      -- Order Status
      status order_status DEFAULT 'pending',

      -- Financial Information
      subtotal DECIMAL(10, 2) NOT NULL,
      tax_amount DECIMAL(10, 2) DEFAULT 0.00,
      shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
      discount_amount DECIMAL(10, 2) DEFAULT 0.00,
      total_amount DECIMAL(10, 2) NOT NULL,

      -- Payment Information
      payment_status payment_status DEFAULT 'pending',
      payment_method payment_method DEFAULT 'card',

      -- Address Information
      billing_address JSONB NOT NULL,
      shipping_address JSONB NOT NULL,

      -- Shipping Information
      shipping_method VARCHAR(100),
      tracking_number VARCHAR(255),
      tracking_url VARCHAR(500),
      estimated_delivery_date DATE,

      -- Order Notes
      customer_notes TEXT,
      admin_notes TEXT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ,
      shipped_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,

      -- Cancellation
      cancellation_reason TEXT,
      cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Order items table
  await db.query(`
    CREATE TABLE order_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
      seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

      -- Item Details
      product_name VARCHAR(255) NOT NULL,
      product_sku VARCHAR(100),
      variant_name VARCHAR(255),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,

      -- Commission Calculation
      commission_rate DECIMAL(5, 4) NOT NULL,
      commission_amount DECIMAL(10, 2) NOT NULL,
      seller_amount DECIMAL(10, 2) NOT NULL,

      -- Product Snapshot
      product_snapshot JSONB,

      -- Item Status
      status order_status DEFAULT 'pending',

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Transactions table
  await db.query(`
    CREATE TABLE transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

      -- Transaction Details
      type transaction_type NOT NULL,
      status transaction_status DEFAULT 'pending',
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',

      -- Payment Gateway Information
      gateway payment_gateway NOT NULL,
      gateway_transaction_id VARCHAR(255),
      gateway_fee DECIMAL(10, 2) DEFAULT 0.00,

      -- Stripe Specific
      stripe_payment_intent_id VARCHAR(255),
      stripe_charge_id VARCHAR(255),

      -- Payment Method Details
      payment_method_type VARCHAR(50),
      payment_method_details JSONB,

      -- Transaction Metadata
      metadata JSONB,
      failure_reason TEXT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );
  `);

  // Create indexes for orders
  await db.query(
    `CREATE INDEX idx_orders_user_status ON orders (user_id, status);`
  );
  await db.query(
    `CREATE INDEX idx_orders_order_number ON orders (order_number);`
  );
  await db.query(
    `CREATE INDEX idx_orders_status_created ON orders (status, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_orders_payment_status ON orders (payment_status);`
  );
  await db.query(`CREATE INDEX idx_orders_created_at ON orders (created_at);`);
  await db.query(
    `CREATE INDEX idx_orders_tracking ON orders (tracking_number);`
  );

  // Create indexes for order_items
  await db.query(
    `CREATE INDEX idx_order_items_order_seller ON order_items (order_id, seller_id);`
  );
  await db.query(
    `CREATE INDEX idx_order_items_product_status ON order_items (product_id, status);`
  );
  await db.query(
    `CREATE INDEX idx_order_items_seller_status ON order_items (seller_id, status, created_at);`
  );

  // Create indexes for transactions
  await db.query(
    `CREATE INDEX idx_transactions_order_type ON transactions (order_id, type);`
  );
  await db.query(
    `CREATE INDEX idx_transactions_gateway_transaction ON transactions (gateway, gateway_transaction_id);`
  );
  await db.query(
    `CREATE INDEX idx_transactions_stripe_payment_intent ON transactions (stripe_payment_intent_id);`
  );
  await db.query(
    `CREATE INDEX idx_transactions_status_created ON transactions (status, created_at);`
  );

  // Create triggers
  await db.query(`
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await db.query(`
    CREATE TRIGGER update_order_items_updated_at
      BEFORE UPDATE ON order_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await db.query(`
    CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createPayoutTables(db: any) {
  // Seller payouts table
  await db.query(`
    CREATE TABLE seller_payouts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

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
      status payout_status DEFAULT 'pending',

      -- Payment Information
      payment_method payout_method NOT NULL,
      payment_reference VARCHAR(255),
      payment_details JSONB,

      -- Metadata
      order_count INTEGER NOT NULL,
      notes TEXT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    );
  `);

  // Payout items table
  await db.query(`
    CREATE TABLE payout_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      payout_id UUID NOT NULL REFERENCES seller_payouts(id) ON DELETE CASCADE,
      order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,

      -- Item Financial Details
      item_total DECIMAL(10, 2) NOT NULL,
      commission_rate DECIMAL(5, 4) NOT NULL,
      commission_amount DECIMAL(10, 2) NOT NULL,
      seller_amount DECIMAL(10, 2) NOT NULL,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),

      -- Constraints
      UNIQUE (payout_id, order_item_id)
    );
  `);

  // Create indexes for seller_payouts
  await db.query(
    `CREATE INDEX idx_seller_payouts_seller_period ON seller_payouts (seller_id, payout_period_start, payout_period_end);`
  );
  await db.query(
    `CREATE INDEX idx_seller_payouts_status_created ON seller_payouts (status, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_seller_payouts_payment_reference ON seller_payouts (payment_reference);`
  );

  // Create indexes for payout_items
  await db.query(
    `CREATE INDEX idx_payout_items_payout_item ON payout_items (payout_id, order_item_id);`
  );

  // Create trigger
  await db.query(`
    CREATE TRIGGER update_seller_payouts_updated_at
      BEFORE UPDATE ON seller_payouts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createReviewTables(db: any) {
  // Reviews table
  await db.query(`
    CREATE TABLE reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,

      -- Review Content
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(255),
      content TEXT,

      -- Media
      images JSONB,

      -- Review Status
      status review_status DEFAULT 'pending',
      moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      moderation_notes TEXT,

      -- Helpfulness
      helpful_count INTEGER DEFAULT 0,
      not_helpful_count INTEGER DEFAULT 0,

      -- Verification
      is_verified_purchase BOOLEAN DEFAULT FALSE,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      moderated_at TIMESTAMPTZ,

      -- Constraints
      UNIQUE (user_id, product_id)
    );
  `);

  // Review helpfulness table
  await db.query(`
    CREATE TABLE review_helpfulness (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_helpful BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),

      -- Constraints
      UNIQUE (user_id, review_id)
    );
  `);

  // Create indexes for reviews
  await db.query(
    `CREATE INDEX idx_reviews_product_status ON reviews (product_id, status);`
  );
  await db.query(
    `CREATE INDEX idx_reviews_user_product ON reviews (user_id, product_id);`
  );
  await db.query(`CREATE INDEX idx_reviews_rating ON reviews (rating);`);
  await db.query(
    `CREATE INDEX idx_reviews_status_created ON reviews (status, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_reviews_verified_purchase ON reviews (is_verified_purchase);`
  );

  // Create indexes for review_helpfulness
  await db.query(
    `CREATE INDEX idx_review_helpfulness_review_helpful ON review_helpfulness (review_id, is_helpful);`
  );

  // Create trigger
  await db.query(`
    CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createCouponTables(db: any) {
  // Coupons table
  await db.query(`
    CREATE TABLE coupons (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      -- Coupon Details
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,

      -- Discount Configuration
      type coupon_type NOT NULL,
      value DECIMAL(10, 2) NOT NULL,
      minimum_amount DECIMAL(10, 2),
      maximum_discount DECIMAL(10, 2),

      -- Usage Limits
      usage_limit INTEGER,
      usage_limit_per_user INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0,

      -- Validity
      starts_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,

      -- Restrictions
      applicable_to coupon_applicable_to DEFAULT 'all',
      applicable_ids JSONB,

      -- Creator
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Coupon usage table
  await db.query(`
    CREATE TABLE coupon_usage (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

      -- Usage Details
      discount_amount DECIMAL(10, 2) NOT NULL,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),

      -- Constraints
      UNIQUE (coupon_id, order_id)
    );
  `);

  // Create indexes for coupons
  await db.query(`CREATE INDEX idx_coupons_code ON coupons (code);`);
  await db.query(
    `CREATE INDEX idx_coupons_active_dates ON coupons (is_active, starts_at, expires_at);`
  );
  await db.query(`CREATE INDEX idx_coupons_type ON coupons (type);`);
  await db.query(
    `CREATE INDEX idx_coupons_created_by ON coupons (created_by);`
  );

  // Create indexes for coupon_usage
  await db.query(
    `CREATE INDEX idx_coupon_usage_coupon_user ON coupon_usage (coupon_id, user_id);`
  );
  await db.query(
    `CREATE INDEX idx_coupon_usage_order ON coupon_usage (order_id);`
  );

  // Create trigger
  await db.query(`
    CREATE TRIGGER update_coupons_updated_at
      BEFORE UPDATE ON coupons
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createNotificationTables(db: any) {
  // Notifications table
  await db.query(`
    CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      -- Notification Content
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,

      -- Notification Data
      data JSONB,
      action_url VARCHAR(500),

      -- Status
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMPTZ,

      -- Delivery Channels
      sent_email BOOLEAN DEFAULT FALSE,
      sent_sms BOOLEAN DEFAULT FALSE,
      sent_push BOOLEAN DEFAULT FALSE,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes for notifications
  await db.query(
    `CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);`
  );
  await db.query(
    `CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_notifications_type ON notifications (type);`
  );

  // Create trigger
  await db.query(`
    CREATE TRIGGER update_notifications_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createSystemTables(db: any) {
  // Settings table
  await db.query(`
    CREATE TABLE settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      -- Setting Details
      key_name VARCHAR(100) NOT NULL UNIQUE,
      value TEXT,
      data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'integer', 'decimal', 'boolean', 'json')),

      -- Metadata
      category VARCHAR(50) DEFAULT 'general',
      description TEXT,
      is_public BOOLEAN DEFAULT FALSE,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes for settings
  await db.query(`CREATE INDEX idx_settings_category ON settings (category);`);
  await db.query(`CREATE INDEX idx_settings_public ON settings (is_public);`);

  // Create trigger
  await db.query(`
    CREATE TRIGGER update_settings_updated_at
      BEFORE UPDATE ON settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function createAuditTables(db: any) {
  // Audit logs table
  await db.query(`
    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      table_name VARCHAR(64) NOT NULL,
      record_id UUID NOT NULL,
      action audit_action NOT NULL,
      old_values JSONB,
      new_values JSONB,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes for audit_logs
  await db.query(
    `CREATE INDEX idx_audit_table_record ON audit_logs (table_name, record_id);`
  );
  await db.query(
    `CREATE INDEX idx_audit_user_action ON audit_logs (user_id, action, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_audit_created_at ON audit_logs (created_at);`
  );
  await db.query(
    `CREATE INDEX idx_audit_old_values ON audit_logs USING GIN (old_values);`
  );
  await db.query(
    `CREATE INDEX idx_audit_new_values ON audit_logs USING GIN (new_values);`
  );
}

async function createPerformanceIndexes(db: any) {
  console.log("Creating composite indexes for common queries...");

  // Product search and filtering indexes
  await db.query(
    `CREATE INDEX idx_products_category_status_price ON products (category_id, status, price);`
  );
  await db.query(
    `CREATE INDEX idx_products_seller_status_created ON products (seller_id, status, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_products_status_rating_created ON products (status, average_rating, created_at);`
  );

  // Order management indexes
  await db.query(
    `CREATE INDEX idx_orders_user_status_created ON orders (user_id, status, created_at);`
  );
  await db.query(
    `CREATE INDEX idx_orders_status_payment_created ON orders (status, payment_status, created_at);`
  );

  // Analytics indexes
  await db.query(
    `CREATE INDEX idx_order_items_seller_created_status ON order_items (seller_id, created_at, status);`
  );
  await db.query(
    `CREATE INDEX idx_order_items_product_created_status ON order_items (product_id, created_at, status);`
  );

  console.log("Performance indexes created successfully!");
}

// Execute the initialization
if (require.main === module) {
  initializeDatabaseSchema()
    .then(() => {
      console.log("🎉 Database schema initialization completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database schema initialization failed:", error);
      process.exit(1);
    });
}

export { initializeDatabaseSchema };
