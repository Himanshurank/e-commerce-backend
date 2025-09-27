import dotenv from "dotenv";
import { DatabaseFactory } from "../shared/factories/databaseFactory";
import { EConnectionTypes } from "../shared/infrastructure/config/database";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

async function seedSampleData() {
  console.log("🌱 Seeding sample data...");

  try {
    const mainDb = DatabaseFactory.getDatabase(EConnectionTypes.main);

    // 1. Create admin user
    console.log("👤 Creating admin user...");
    await createAdminUser(mainDb);

    // 2. Create sample sellers
    console.log("🏪 Creating sample sellers...");
    const sellerIds = await createSampleSellers(mainDb);

    // 3. Create categories
    console.log("📂 Creating categories...");
    const categoryIds = await createCategories(mainDb);

    // 4. Create sample products
    console.log("📦 Creating sample products...");
    await createSampleProducts(mainDb, sellerIds, categoryIds);

    // 5. Create sample customers
    console.log("👥 Creating sample customers...");
    const customerIds = await createSampleCustomers(mainDb);

    // 6. Create sample orders
    console.log("📋 Creating sample orders...");
    await createSampleOrders(mainDb, customerIds, sellerIds);

    // 7. Create sample reviews
    console.log("⭐ Creating sample reviews...");
    await createSampleReviews(mainDb, customerIds);

    // 8. Create sample coupons
    console.log("🎫 Creating sample coupons...");
    await createSampleCoupons(mainDb);

    console.log("✅ Sample data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Sample data seeding failed:", error);
    throw error;
  } finally {
    await DatabaseFactory.closeAllConnections();
  }
}

async function createAdminUser(db: any) {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const result = await db.query(
    `
    INSERT INTO users (email, password, name, role, status, email_verified)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `,
    [
      "admin@ecommerce.com",
      hashedPassword,
      "System Administrator",
      "admin",
      "approved",
      true,
    ]
  );

  if (result.rows.length > 0) {
    console.log("  ✅ Admin user created");
  } else {
    console.log("  ℹ️  Admin user already exists");
  }
}

async function createSampleSellers(db: any): Promise<string[]> {
  const hashedPassword = await bcrypt.hash("seller123", 12);
  const sellerIds: string[] = [];

  const sellers = [
    {
      email: "techstore@example.com",
      name: "Tech Store Inc",
      businessName: "Tech Store Inc",
      businessType: "corporation",
    },
    {
      email: "fashionhub@example.com",
      name: "Fashion Hub",
      businessName: "Fashion Hub LLC",
      businessType: "llc",
    },
    {
      email: "homegoods@example.com",
      name: "Home & Garden Co",
      businessName: "Home & Garden Co",
      businessType: "partnership",
    },
  ];

  for (const seller of sellers) {
    // Create user
    const userResult = await db.query(
      `
      INSERT INTO users (email, password, name, role, status, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET name = $3
      RETURNING id
    `,
      [seller.email, hashedPassword, seller.name, "seller", "approved", true]
    );

    const userId = userResult.rows[0].id;
    sellerIds.push(userId);

    // Create seller profile
    await db.query(
      `
      INSERT INTO seller_profiles (
        user_id, business_name, business_type, verification_status,
        business_address, commission_rate, verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        business_name = $2,
        verification_status = $4
    `,
      [
        userId,
        seller.businessName,
        seller.businessType,
        "approved",
        JSON.stringify({
          street: "123 Business St",
          city: "Commerce City",
          state: "CA",
          postal_code: "90210",
          country: "USA",
        }),
        0.05, // 5% commission
        new Date(),
      ]
    );
  }

  console.log(`  ✅ Created ${sellers.length} sellers`);
  return sellerIds;
}

async function createCategories(db: any): Promise<string[]> {
  const categoryIds: string[] = [];

  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Clothing and accessories",
    },
    {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Home improvement and garden supplies",
    },
    {
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description: "Sports equipment and outdoor gear",
    },
    {
      name: "Books",
      slug: "books",
      description: "Books and educational materials",
    },
  ];

  for (const category of categories) {
    const result = await db.query(
      `
      INSERT INTO categories (name, slug, description, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3
      RETURNING id
    `,
      [category.name, category.slug, category.description, true]
    );

    categoryIds.push(result.rows[0].id);
  }

  console.log(`  ✅ Created ${categories.length} categories`);
  return categoryIds;
}

async function createSampleProducts(
  db: any,
  sellerIds: string[],
  categoryIds: string[]
) {
  const products = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description:
        "Latest Apple smartphone with advanced camera system and A17 Pro chip.",
      short_description: "Premium smartphone with cutting-edge technology.",
      price: 999.99,
      compare_price: 1099.99,
      sku: "IPHONE15PRO",
      stock_quantity: 50,
      category: 0, // Electronics
      seller: 0, // Tech Store
      images: JSON.stringify([
        "https://example.com/iphone15pro-1.jpg",
        "https://example.com/iphone15pro-2.jpg",
      ]),
      tags: JSON.stringify(["smartphone", "apple", "premium", "camera"]),
      status: "active",
    },
    {
      name: "MacBook Air M2",
      slug: "macbook-air-m2",
      description:
        "Lightweight laptop with M2 chip, perfect for work and creativity.",
      short_description: "Ultra-thin laptop with incredible performance.",
      price: 1299.99,
      sku: "MACBOOK-AIR-M2",
      stock_quantity: 25,
      category: 0, // Electronics
      seller: 0, // Tech Store
      images: JSON.stringify(["https://example.com/macbook-air-1.jpg"]),
      tags: JSON.stringify(["laptop", "apple", "portable", "work"]),
      status: "active",
    },
    {
      name: "Designer Jeans",
      slug: "designer-jeans",
      description: "Premium denim jeans with perfect fit and comfort.",
      short_description: "Stylish and comfortable designer jeans.",
      price: 89.99,
      compare_price: 120.0,
      sku: "JEANS-001",
      stock_quantity: 100,
      category: 1, // Fashion
      seller: 1, // Fashion Hub
      images: JSON.stringify(["https://example.com/jeans-1.jpg"]),
      tags: JSON.stringify(["jeans", "fashion", "denim", "casual"]),
      status: "active",
    },
    {
      name: "Garden Tool Set",
      slug: "garden-tool-set",
      description:
        "Complete set of essential gardening tools for home gardeners.",
      short_description: "7-piece professional garden tool set.",
      price: 49.99,
      sku: "GARDEN-TOOLS-001",
      stock_quantity: 75,
      category: 2, // Home & Garden
      seller: 2, // Home & Garden Co
      images: JSON.stringify(["https://example.com/garden-tools-1.jpg"]),
      tags: JSON.stringify(["gardening", "tools", "outdoor", "home"]),
      status: "active",
    },
    {
      name: "Running Shoes",
      slug: "running-shoes",
      description: "High-performance running shoes with advanced cushioning.",
      short_description: "Comfortable running shoes for athletes.",
      price: 129.99,
      sku: "RUNNING-SHOES-001",
      stock_quantity: 80,
      category: 3, // Sports & Outdoors
      seller: 1, // Fashion Hub (also sells sports items)
      images: JSON.stringify(["https://example.com/running-shoes-1.jpg"]),
      tags: JSON.stringify(["shoes", "running", "sports", "fitness"]),
      status: "active",
    },
  ];

  for (const product of products) {
    await db.query(
      `
      INSERT INTO products (
        seller_id, category_id, name, slug, description, short_description,
        price, compare_price, sku, stock_quantity, images, tags, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (slug) DO UPDATE SET
        name = $3, description = $5, price = $7
    `,
      [
        sellerIds[product.seller],
        categoryIds[product.category],
        product.name,
        product.slug,
        product.description,
        product.short_description,
        product.price,
        product.compare_price || null,
        product.sku,
        product.stock_quantity,
        product.images,
        product.tags,
        product.status,
      ]
    );
  }

  console.log(`  ✅ Created ${products.length} products`);
}

async function createSampleCustomers(db: any): Promise<string[]> {
  const hashedPassword = await bcrypt.hash("customer123", 12);
  const customerIds: string[] = [];

  const customers = [
    { email: "john.doe@example.com", name: "John Doe" },
    { email: "jane.smith@example.com", name: "Jane Smith" },
    { email: "mike.johnson@example.com", name: "Mike Johnson" },
  ];

  for (const customer of customers) {
    const result = await db.query(
      `
      INSERT INTO users (email, password, name, role, status, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET name = $3
      RETURNING id
    `,
      [
        customer.email,
        hashedPassword,
        customer.name,
        "customer",
        "approved",
        true,
      ]
    );

    customerIds.push(result.rows[0].id);
  }

  console.log(`  ✅ Created ${customers.length} customers`);
  return customerIds;
}

async function createSampleOrders(
  db: any,
  customerIds: string[],
  sellerIds: string[]
) {
  // Get some products for orders
  const productsResult = await db.query(`
    SELECT id, seller_id, name, price, sku FROM products LIMIT 5
  `);
  const products = productsResult.rows;

  const orders = [
    {
      customerId: customerIds[0],
      orderNumber: "ORD-20241201-00001",
      status: "delivered",
      paymentStatus: "paid",
      subtotal: 999.99,
      taxAmount: 80.0,
      shippingAmount: 15.0,
      totalAmount: 1094.99,
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "90210",
        country: "USA",
      },
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "90210",
        country: "USA",
      },
    },
  ];

  for (const order of orders) {
    // Create order
    const orderResult = await db.query(
      `
      INSERT INTO orders (
        user_id, order_number, status, payment_status, subtotal,
        tax_amount, shipping_amount, total_amount, billing_address,
        shipping_address, confirmed_at, delivered_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `,
      [
        order.customerId,
        order.orderNumber,
        order.status,
        order.paymentStatus,
        order.subtotal,
        order.taxAmount,
        order.shippingAmount,
        order.totalAmount,
        JSON.stringify(order.billingAddress),
        JSON.stringify(order.shippingAddress),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Create order item
    const product = products[0]; // iPhone 15 Pro
    const commissionRate = 0.05; // 5%
    const commissionAmount = order.subtotal * commissionRate;
    const sellerAmount = order.subtotal - commissionAmount;

    await db.query(
      `
      INSERT INTO order_items (
        order_id, product_id, seller_id, product_name, product_sku,
        quantity, unit_price, total_price, commission_rate,
        commission_amount, seller_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
      [
        orderId,
        product.id,
        product.seller_id,
        product.name,
        product.sku,
        1,
        order.subtotal,
        order.subtotal,
        commissionRate,
        commissionAmount,
        sellerAmount,
        order.status,
      ]
    );

    // Create transaction
    await db.query(
      `
      INSERT INTO transactions (
        order_id, type, status, amount, gateway, stripe_payment_intent_id,
        payment_method_type, processed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        orderId,
        "payment",
        "succeeded",
        order.totalAmount,
        "stripe",
        "pi_test_1234567890",
        "card",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ]
    );
  }

  console.log(`  ✅ Created ${orders.length} orders`);
}

async function createSampleReviews(db: any, customerIds: string[]) {
  // Get products for reviews
  const productsResult = await db.query(`
    SELECT id FROM products LIMIT 3
  `);
  const products = productsResult.rows;

  const reviews = [
    {
      productId: products[0].id,
      customerId: customerIds[0],
      rating: 5,
      title: "Excellent product!",
      content: "Amazing quality and fast shipping. Highly recommend!",
      status: "approved",
    },
    {
      productId: products[1].id,
      customerId: customerIds[1],
      rating: 4,
      title: "Good value",
      content: "Great product for the price. Very satisfied with the purchase.",
      status: "approved",
    },
  ];

  for (const review of reviews) {
    await db.query(
      `
      INSERT INTO reviews (
        product_id, user_id, rating, title, content, status,
        is_verified_purchase, moderated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, product_id) DO NOTHING
    `,
      [
        review.productId,
        review.customerId,
        review.rating,
        review.title,
        review.content,
        review.status,
        true,
        new Date(),
      ]
    );
  }

  console.log(`  ✅ Created ${reviews.length} reviews`);
}

async function createSampleCoupons(db: any) {
  // Get admin user for created_by
  const adminResult = await db.query(`
    SELECT id FROM users WHERE role = 'admin' LIMIT 1
  `);
  const adminId = adminResult.rows[0].id;

  const coupons = [
    {
      code: "WELCOME10",
      name: "Welcome Discount",
      description: "10% off for new customers",
      type: "percentage",
      value: 10.0,
      minimumAmount: 50.0,
      maximumDiscount: 100.0,
      usageLimit: 1000,
      usageLimitPerUser: 1,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      applicableTo: "all",
    },
    {
      code: "SAVE20",
      name: "Save $20",
      description: "$20 off orders over $100",
      type: "fixed_amount",
      value: 20.0,
      minimumAmount: 100.0,
      usageLimit: 500,
      usageLimitPerUser: 3,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      isActive: true,
      applicableTo: "all",
    },
  ];

  for (const coupon of coupons) {
    await db.query(
      `
      INSERT INTO coupons (
        code, name, description, type, value, minimum_amount,
        maximum_discount, usage_limit, usage_limit_per_user,
        starts_at, expires_at, is_active, applicable_to, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (code) DO NOTHING
    `,
      [
        coupon.code,
        coupon.name,
        coupon.description,
        coupon.type,
        coupon.value,
        coupon.minimumAmount,
        coupon.maximumDiscount || null,
        coupon.usageLimit,
        coupon.usageLimitPerUser,
        coupon.startsAt,
        coupon.expiresAt,
        coupon.isActive,
        coupon.applicableTo,
        adminId,
      ]
    );
  }

  console.log(`  ✅ Created ${coupons.length} coupons`);
}

// Execute the seeding
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log("🎉 Sample data seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Sample data seeding failed:", error);
      process.exit(1);
    });
}

export { seedSampleData };
