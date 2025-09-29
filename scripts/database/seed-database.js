const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

class DatabaseSeeder {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async seed() {
    console.log("🌱 Starting database seeding...");

    try {
      const client = await this.pool.connect();

      // Clear existing data (except admin user)
      await this.clearExistingData(client);

      // Seed data in order
      const users = await this.seedUsers(client);
      const categories = await this.seedCategories(client);
      const products = await this.seedProducts(
        client,
        users.sellers,
        categories
      );
      await this.seedProductVariants(client, products);
      await this.seedOrders(client, users.customers, products);
      await this.seedReviews(client, users.customers, products);
      await this.seedCoupons(client, users.admin);
      await this.seedSettings(client);

      client.release();
      await this.pool.end();

      console.log("🎉 Database seeding completed successfully!");
      console.log("📊 Sample data summary:");
      console.log(`   • ${users.customers.length} customers`);
      console.log(`   • ${users.sellers.length} sellers`);
      console.log(`   • ${categories.length} categories`);
      console.log(`   • ${products.length} products`);
      console.log("   • Product variants, orders, reviews, and coupons");
    } catch (error) {
      console.error("❌ Seeding failed:", error.message);
      process.exit(1);
    }
  }

  async clearExistingData(client) {
    console.log("🧹 Clearing existing sample data...");

    // Delete in reverse dependency order
    const tables = [
      "review_helpfulness",
      "reviews",
      "coupon_usage",
      "coupons",
      "notifications",
      "wishlists",
      "payout_items",
      "seller_payouts",
      "transactions",
      "order_items",
      "orders",
      "cart_items",
      "carts",
      "product_variants",
      "products",
      "categories",
      "seller_profiles",
      "user_addresses",
      "user_sessions",
    ];

    for (const table of tables) {
      await client.query(`DELETE FROM ${table}`);
    }

    // Delete users except admin
    await client.query(
      `DELETE FROM users WHERE email != 'admin@ecommerce.com'`
    );

    console.log("   ✅ Existing data cleared");
  }

  async seedUsers(client) {
    console.log("👥 Seeding users...");

    const passwordHash = await bcrypt.hash("password123", 12);

    // Create customers
    const customers = [];
    const customerData = [
      {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
      },
      {
        email: "jane.smith@example.com",
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1234567891",
      },
      {
        email: "mike.johnson@example.com",
        firstName: "Mike",
        lastName: "Johnson",
        phone: "+1234567892",
      },
      {
        email: "sarah.wilson@example.com",
        firstName: "Sarah",
        lastName: "Wilson",
        phone: "+1234567893",
      },
      {
        email: "david.brown@example.com",
        firstName: "David",
        lastName: "Brown",
        phone: "+1234567894",
      },
    ];

    for (const customer of customerData) {
      const result = await client.query(
        `
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, status, email_verified)
        VALUES ($1, $2, $3, $4, $5, 'customer', 'approved', true)
        RETURNING id, email, first_name, last_name
      `,
        [
          customer.email,
          passwordHash,
          customer.firstName,
          customer.lastName,
          customer.phone,
        ]
      );

      customers.push(result.rows[0]);
    }

    // Create sellers
    const sellers = [];
    const sellerData = [
      {
        email: "tech.store@example.com",
        firstName: "Tech",
        lastName: "Store",
        businessName: "TechHub Electronics",
        businessType: "corporation",
      },
      {
        email: "fashion.boutique@example.com",
        firstName: "Fashion",
        lastName: "Boutique",
        businessName: "Style & Grace Fashion",
        businessType: "llc",
      },
      {
        email: "home.garden@example.com",
        firstName: "Home",
        lastName: "Garden",
        businessName: "Green Thumb Gardens",
        businessType: "sole_proprietorship",
      },
    ];

    for (const seller of sellerData) {
      // Create user
      const userResult = await client.query(
        `
        INSERT INTO users (email, password_hash, first_name, last_name, role, status, email_verified)
        VALUES ($1, $2, $3, $4, 'seller', 'approved', true)
        RETURNING id, email, first_name, last_name
      `,
        [seller.email, passwordHash, seller.firstName, seller.lastName]
      );

      const user = userResult.rows[0];

      // Create seller profile
      await client.query(
        `
        INSERT INTO seller_profiles (
          user_id, business_name, business_type, business_email,
          business_address, verification_status, verified_at
        ) VALUES ($1, $2, $3, $4, $5, 'approved', NOW())
      `,
        [
          user.id,
          seller.businessName,
          seller.businessType,
          seller.email,
          JSON.stringify({
            address_line_1: "123 Business St",
            city: "Business City",
            state: "BC",
            postal_code: "12345",
            country: "US",
          }),
        ]
      );

      sellers.push(user);
    }

    // Get admin user
    const adminResult = await client.query(`
      SELECT id, email, first_name, last_name FROM users WHERE email = 'admin@ecommerce.com'
    `);
    const admin = adminResult.rows[0];

    console.log(
      `   ✅ Created ${customers.length} customers and ${sellers.length} sellers`
    );

    return { customers, sellers, admin };
  }

  async seedCategories(client) {
    console.log("📂 Seeding categories...");

    const categories = [];
    const categoryData = [
      {
        name: "Electronics",
        slug: "electronics",
        description: "Latest electronic devices and gadgets",
      },
      {
        name: "Smartphones",
        slug: "smartphones",
        description: "Mobile phones and accessories",
        parent: "electronics",
      },
      {
        name: "Laptops",
        slug: "laptops",
        description: "Laptops and computer accessories",
        parent: "electronics",
      },
      {
        name: "Clothing",
        slug: "clothing",
        description: "Fashion and apparel for all",
      },
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Clothing for men",
        parent: "clothing",
      },
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Clothing for women",
        parent: "clothing",
      },
      {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Home improvement and garden supplies",
      },
      {
        name: "Books",
        slug: "books",
        description: "Books and educational materials",
      },
      {
        name: "Sports",
        slug: "sports",
        description: "Sports equipment and gear",
      },
    ];

    // First pass: create parent categories
    for (const cat of categoryData.filter((c) => !c.parent)) {
      const result = await client.query(
        `
        INSERT INTO categories (name, slug, description, level, is_active)
        VALUES ($1, $2, $3, 0, true)
        RETURNING id, name, slug
      `,
        [cat.name, cat.slug, cat.description]
      );

      categories.push({ ...result.rows[0], parent_id: null });
    }

    // Second pass: create child categories
    for (const cat of categoryData.filter((c) => c.parent)) {
      const parent = categories.find((p) => p.slug === cat.parent);
      if (parent) {
        const result = await client.query(
          `
          INSERT INTO categories (name, slug, description, parent_id, level, is_active)
          VALUES ($1, $2, $3, $4, 1, true)
          RETURNING id, name, slug
        `,
          [cat.name, cat.slug, cat.description, parent.id]
        );

        categories.push({ ...result.rows[0], parent_id: parent.id });
      }
    }

    console.log(`   ✅ Created ${categories.length} categories`);
    return categories;
  }

  async seedProducts(client, sellers, categories) {
    console.log("📦 Seeding products...");

    const products = [];

    // Electronics products
    const electronicsCategory = categories.find(
      (c) => c.slug === "electronics"
    );
    const smartphonesCategory = categories.find(
      (c) => c.slug === "smartphones"
    );
    const laptopsCategory = categories.find((c) => c.slug === "laptops");
    const techSeller = sellers.find(
      (s) => s.email === "tech.store@example.com"
    );

    const electronicsProducts = [
      {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description:
          "Latest iPhone with advanced camera system and A17 Pro chip",
        short_description: "Premium smartphone with cutting-edge technology",
        price: 999.99,
        compare_price: 1099.99,
        sku: "IPH15PRO",
        stock_quantity: 50,
        category_id: smartphonesCategory.id,
        seller_id: techSeller.id,
        images: JSON.stringify([
          {
            url: "https://example.com/iphone15pro-1.jpg",
            alt: "iPhone 15 Pro front view",
          },
          {
            url: "https://example.com/iphone15pro-2.jpg",
            alt: "iPhone 15 Pro back view",
          },
        ]),
        tags: JSON.stringify(["smartphone", "apple", "premium", "5g"]),
      },
      {
        name: 'MacBook Pro 16"',
        slug: "macbook-pro-16",
        description: "Powerful laptop for professionals with M3 Pro chip",
        short_description: "High-performance laptop for creative professionals",
        price: 2499.99,
        compare_price: 2699.99,
        sku: "MBP16M3",
        stock_quantity: 25,
        category_id: laptopsCategory.id,
        seller_id: techSeller.id,
        images: JSON.stringify([
          {
            url: "https://example.com/macbook-1.jpg",
            alt: "MacBook Pro closed",
          },
          { url: "https://example.com/macbook-2.jpg", alt: "MacBook Pro open" },
        ]),
        tags: JSON.stringify(["laptop", "apple", "professional", "m3"]),
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description:
          "Premium Android smartphone with S Pen and advanced AI features",
        short_description: "Flagship Android phone with S Pen",
        price: 1199.99,
        sku: "SGS24U",
        stock_quantity: 40,
        category_id: smartphonesCategory.id,
        seller_id: techSeller.id,
        images: JSON.stringify([
          {
            url: "https://example.com/galaxy-s24-1.jpg",
            alt: "Galaxy S24 Ultra",
          },
        ]),
        tags: JSON.stringify(["smartphone", "samsung", "android", "s-pen"]),
      },
    ];

    // Clothing products
    const clothingCategory = categories.find((c) => c.slug === "clothing");
    const mensCategory = categories.find((c) => c.slug === "mens-clothing");
    const womensCategory = categories.find((c) => c.slug === "womens-clothing");
    const fashionSeller = sellers.find(
      (s) => s.email === "fashion.boutique@example.com"
    );

    const clothingProducts = [
      {
        name: "Premium Cotton T-Shirt",
        slug: "premium-cotton-tshirt",
        description:
          "Comfortable 100% organic cotton t-shirt in various colors",
        short_description: "Soft organic cotton t-shirt",
        price: 29.99,
        sku: "TSHIRT001",
        stock_quantity: 100,
        category_id: mensCategory.id,
        seller_id: fashionSeller.id,
        images: JSON.stringify([
          { url: "https://example.com/tshirt-1.jpg", alt: "Cotton T-Shirt" },
        ]),
        tags: JSON.stringify(["clothing", "cotton", "casual", "organic"]),
      },
      {
        name: "Designer Jeans",
        slug: "designer-jeans",
        description: "Premium denim jeans with perfect fit and comfort",
        short_description: "Stylish premium denim jeans",
        price: 89.99,
        compare_price: 120.0,
        sku: "JEANS001",
        stock_quantity: 75,
        category_id: womensCategory.id,
        seller_id: fashionSeller.id,
        images: JSON.stringify([
          { url: "https://example.com/jeans-1.jpg", alt: "Designer Jeans" },
        ]),
        tags: JSON.stringify(["jeans", "denim", "designer", "fashion"]),
      },
    ];

    // Home & Garden products
    const homeCategory = categories.find((c) => c.slug === "home-garden");
    const homeSeller = sellers.find(
      (s) => s.email === "home.garden@example.com"
    );

    const homeProducts = [
      {
        name: "Indoor Plant Collection",
        slug: "indoor-plant-collection",
        description: "Beautiful collection of air-purifying indoor plants",
        short_description: "Set of 3 air-purifying plants",
        price: 49.99,
        sku: "PLANTS001",
        stock_quantity: 30,
        category_id: homeCategory.id,
        seller_id: homeSeller.id,
        images: JSON.stringify([
          { url: "https://example.com/plants-1.jpg", alt: "Indoor Plants" },
        ]),
        tags: JSON.stringify(["plants", "indoor", "air-purifying", "home"]),
      },
    ];

    const allProducts = [
      ...electronicsProducts,
      ...clothingProducts,
      ...homeProducts,
    ];

    for (const product of allProducts) {
      const result = await client.query(
        `
        INSERT INTO products (
          name, slug, description, short_description, price, compare_price,
          sku, stock_quantity, category_id, seller_id, images, tags,
          status, visibility
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', 'public')
        RETURNING id, name, slug, price
      `,
        [
          product.name,
          product.slug,
          product.description,
          product.short_description,
          product.price,
          product.compare_price,
          product.sku,
          product.stock_quantity,
          product.category_id,
          product.seller_id,
          product.images,
          product.tags,
        ]
      );

      products.push(result.rows[0]);
    }

    console.log(`   ✅ Created ${products.length} products`);
    return products;
  }

  async seedProductVariants(client, products) {
    console.log("🎨 Seeding product variants...");

    let variantCount = 0;

    // Add variants for clothing items
    const tshirtProduct = products.find(
      (p) => p.slug === "premium-cotton-tshirt"
    );
    if (tshirtProduct) {
      const sizes = ["S", "M", "L", "XL"];
      const colors = ["Black", "White", "Navy", "Gray"];

      for (const size of sizes) {
        for (const color of colors) {
          await client.query(
            `
            INSERT INTO product_variants (
              product_id, name, sku, price, stock_quantity, attributes, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, true)
          `,
            [
              tshirtProduct.id,
              `${color} - ${size}`,
              `TSHIRT001-${color.toUpperCase()}-${size}`,
              29.99,
              Math.floor(Math.random() * 20) + 5,
              JSON.stringify({ color: color, size: size }),
            ]
          );
          variantCount++;
        }
      }
    }

    console.log(`   ✅ Created ${variantCount} product variants`);
  }

  async seedOrders(client, customers, products) {
    console.log("🛒 Seeding orders...");

    let orderCount = 0;

    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const orderProducts = products.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      );

      let subtotal = 0;
      const orderItems = [];

      for (const product of orderProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;

        orderItems.push({
          product_id: product.id,
          quantity: quantity,
          unit_price: product.price,
          total_price: itemTotal,
        });
      }

      const taxAmount = subtotal * 0.08; // 8% tax
      const shippingAmount = 9.99;
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Create order
      const orderResult = await client.query(
        `
        INSERT INTO orders (
          user_id, status, subtotal, tax_amount, shipping_amount,
          total_amount, payment_status, billing_address, shipping_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, order_number
      `,
        [
          customer.id,
          ["pending", "confirmed", "shipped", "delivered"][
            Math.floor(Math.random() * 4)
          ],
          subtotal,
          taxAmount,
          shippingAmount,
          totalAmount,
          "paid",
          JSON.stringify({
            first_name: customer.first_name,
            last_name: customer.last_name,
            address_line_1: "123 Main St",
            city: "Anytown",
            state: "ST",
            postal_code: "12345",
            country: "US",
          }),
          JSON.stringify({
            first_name: customer.first_name,
            last_name: customer.last_name,
            address_line_1: "123 Main St",
            city: "Anytown",
            state: "ST",
            postal_code: "12345",
            country: "US",
          }),
        ]
      );

      // Create order items
      for (const item of orderItems) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id, product_id, seller_id, product_name, quantity,
            unit_price, total_price, commission_rate, commission_amount, seller_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
          [
            orderResult.rows[0].id,
            item.product_id,
            products.find((p) => p.id === item.product_id)?.seller_id ||
              customers[0].id,
            products.find((p) => p.id === item.product_id)?.name || "Product",
            item.quantity,
            item.unit_price,
            item.total_price,
            0.05, // 5% commission
            item.total_price * 0.05,
            item.total_price * 0.95,
          ]
        );
      }

      orderCount++;
    }

    console.log(`   ✅ Created ${orderCount} orders with items`);
  }

  async seedReviews(client, customers, products) {
    console.log("⭐ Seeding reviews...");

    let reviewCount = 0;

    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const rating = Math.floor(Math.random() * 5) + 1;

      const reviewTexts = [
        "Great product! Highly recommended.",
        "Good quality and fast shipping.",
        "Exactly as described. Very satisfied.",
        "Excellent value for money.",
        "Outstanding quality and service.",
        "Perfect! Will buy again.",
        "Good product but could be better.",
        "Average quality, decent price.",
      ];

      try {
        await client.query(
          `
          INSERT INTO reviews (
            product_id, user_id, rating, title, content, status, is_verified_purchase
          ) VALUES ($1, $2, $3, $4, $5, 'approved', true)
        `,
          [
            product.id,
            customer.id,
            rating,
            `${rating} star review`,
            reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          ]
        );
        reviewCount++;
      } catch (error) {
        // Skip duplicate reviews (same user + product)
        continue;
      }
    }

    console.log(`   ✅ Created ${reviewCount} reviews`);
  }

  async seedCoupons(client, admin) {
    console.log("🎫 Seeding coupons...");

    const coupons = [
      {
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off for new customers",
        type: "percentage",
        value: 10.0,
        minimum_amount: 50.0,
      },
      {
        code: "FREESHIP",
        name: "Free Shipping",
        description: "Free shipping on orders over $75",
        type: "free_shipping",
        value: 0.0,
        minimum_amount: 75.0,
      },
      {
        code: "SAVE25",
        name: "$25 Off",
        description: "$25 off orders over $200",
        type: "fixed_amount",
        value: 25.0,
        minimum_amount: 200.0,
      },
    ];

    for (const coupon of coupons) {
      await client.query(
        `
        INSERT INTO coupons (
          code, name, description, type, value, minimum_amount,
          usage_limit, starts_at, expires_at, created_by, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      `,
        [
          coupon.code,
          coupon.name,
          coupon.description,
          coupon.type,
          coupon.value,
          coupon.minimum_amount,
          100, // usage limit
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          admin.id,
        ]
      );
    }

    console.log(`   ✅ Created ${coupons.length} coupons`);
  }

  async seedSettings(client) {
    console.log("⚙️  Updating settings...");

    // Update existing settings with more realistic values
    await client.query(`
      UPDATE settings SET value = 'E-Commerce Demo Store' WHERE key_name = 'site_name'
    `);

    console.log("   ✅ Updated settings");
  }
}

// Run the seeder
async function main() {
  const seeder = new DatabaseSeeder();
  await seeder.seed();
}

main().catch(console.error);
