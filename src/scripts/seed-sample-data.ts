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
    {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Skincare, haircare, cosmetics, and personal care products",
    },
    {
      name: "Toys & Games",
      slug: "toys-games",
      description: "Toys, board games, and entertainment for kids and adults",
    },
    {
      name: "Health & Wellness",
      slug: "health-wellness",
      description: "Healthcare products, supplements, and fitness essentials",
    },
    {
      name: "Automotive",
      slug: "automotive",
      description: "Car accessories, tools, and spare parts",
    },
    {
      name: "Jewelry & Watches",
      slug: "jewelry-watches",
      description: "Fine jewelry, fashion accessories, and premium watches",
    },
    {
      name: "Groceries",
      slug: "groceries",
      description: "Everyday food items, snacks, and beverages",
    },
    {
      name: "Office Supplies",
      slug: "office-supplies",
      description: "Stationery, printers, and office essentials",
    },
    {
      name: "Furniture",
      slug: "furniture",
      description: "Indoor and outdoor furniture for home and office",
    },
    {
      name: "Music & Instruments",
      slug: "music-instruments",
      description: "Musical instruments, audio gear, and accessories",
    },
    {
      name: "Pet Supplies",
      slug: "pet-supplies",
      description: "Food, toys, and accessories for pets",
    },
    {
      name: "Baby & Kids",
      slug: "baby-kids",
      description: "Baby care items, kids' clothing, and toys",
    },
    {
      name: "Travel & Luggage",
      slug: "travel-luggage",
      description: "Travel bags, suitcases, and accessories",
    },
    {
      name: "Art & Crafts",
      slug: "art-crafts",
      description: "Craft supplies, art materials, and DIY kits",
    },
    {
      name: "Movies & Entertainment",
      slug: "movies-entertainment",
      description: "DVDs, Blu-rays, collectibles, and pop culture items",
    },
    {
      name: "Gaming",
      slug: "gaming",
      description: "Consoles, video games, and gaming accessories",
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
        "https://images.unsplash.com/photo-1695048132267-2c2c7f8d8e0b",
        "https://images.unsplash.com/photo-1695062908901-830a77b45a2e",
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
      compare_price: 1399.99,
      sku: "MACBOOK-AIR-M2",
      stock_quantity: 25,
      category: 0, // Electronics
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      ]),
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
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583002033449-83e67f97a47c",
      ]),
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
      compare_price: 69.99,
      sku: "GARDEN-TOOLS-001",
      stock_quantity: 75,
      category: 2, // Home & Garden
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
      ]),
      tags: JSON.stringify(["gardening", "tools", "outdoor", "home"]),
      status: "active",
    },
    {
      name: "Running Shoes",
      slug: "running-shoes",
      description: "High-performance running shoes with advanced cushioning.",
      short_description: "Comfortable running shoes for athletes.",
      price: 129.99,
      compare_price: 159.99,
      sku: "RUNNING-SHOES-001",
      stock_quantity: 80,
      category: 3, // Sports & Outdoors
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      ]),
      tags: JSON.stringify(["shoes", "running", "sports", "fitness"]),
      status: "active",
    },
    {
      name: "The Great Gatsby",
      slug: "the-great-gatsby",
      description:
        "Classic novel by F. Scott Fitzgerald, exploring themes of wealth, love, and the American Dream.",
      short_description: "Timeless American literature masterpiece.",
      price: 14.99,
      compare_price: 19.99,
      sku: "BOOK-GATSBY",
      stock_quantity: 200,
      category: 4, // Books
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
      ]),
      tags: JSON.stringify(["book", "classic", "novel", "literature"]),
      status: "active",
    },
    {
      name: "Organic Face Cream",
      slug: "organic-face-cream",
      description:
        "Natural face cream made with organic ingredients for glowing skin.",
      short_description: "Hydrating and nourishing skincare.",
      price: 29.99,
      compare_price: 39.99,
      sku: "BEAUTY-001",
      stock_quantity: 120,
      category: 5, // Beauty & Personal Care
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1596464716121-5d5b0b9b7b49",
      ]),
      tags: JSON.stringify(["skincare", "cream", "organic", "beauty"]),
      status: "active",
    },
    {
      name: "LEGO Classic Set",
      slug: "lego-classic-set",
      description:
        "Creative LEGO set with 500+ colorful pieces for endless building fun.",
      short_description: "Fun and creativity for kids and adults.",
      price: 59.99,
      compare_price: 79.99,
      sku: "TOY-LEGO-001",
      stock_quantity: 150,
      category: 6, // Toys & Games
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1587658194908-54b7a7f2b50a",
      ]),
      tags: JSON.stringify(["lego", "toys", "building", "games"]),
      status: "active",
    },
    {
      name: "Yoga Mat",
      slug: "yoga-mat",
      description:
        "Non-slip yoga mat with extra cushioning for comfort and safety.",
      short_description: "Essential fitness accessory for yoga and workouts.",
      price: 24.99,
      compare_price: 34.99,
      sku: "HEALTH-001",
      stock_quantity: 95,
      category: 7, // Health & Wellness
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1599058917212-d750089bc07c",
      ]),
      tags: JSON.stringify(["yoga", "fitness", "mat", "health"]),
      status: "active",
    },
    {
      name: "Car Vacuum Cleaner",
      slug: "car-vacuum-cleaner",
      description:
        "Portable car vacuum cleaner with strong suction and multiple nozzles.",
      short_description: "Keep your car interior clean and fresh.",
      price: 39.99,
      compare_price: 49.99,
      sku: "AUTO-001",
      stock_quantity: 60,
      category: 8, // Automotive
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1602407294553-6a6eb3c45771",
      ]),
      tags: JSON.stringify(["car", "vacuum", "cleaning", "automotive"]),
      status: "active",
    },
    {
      name: "Diamond Necklace",
      slug: "diamond-necklace",
      description: "Elegant diamond necklace made with 18k gold.",
      short_description: "Luxury jewelry piece for special occasions.",
      price: 2499.99,
      compare_price: 2899.99,
      sku: "JEWEL-001",
      stock_quantity: 15,
      category: 9, // Jewelry & Watches
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617038220303-6d92d9275480",
      ]),
      tags: JSON.stringify(["jewelry", "diamond", "necklace", "luxury"]),
      status: "active",
    },
    {
      name: "Swiss Chronograph Watch",
      slug: "swiss-chronograph-watch",
      description:
        "Premium Swiss-made chronograph watch with stainless steel design.",
      short_description: "Classic luxury watch with precision movement.",
      price: 799.99,
      compare_price: 899.99,
      sku: "WATCH-001",
      stock_quantity: 25,
      category: 9,
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      ]),
      tags: JSON.stringify(["watch", "luxury", "swiss", "chronograph"]),
      status: "active",
    },
    {
      name: "Organic Coffee Beans",
      slug: "organic-coffee-beans",
      description: "Freshly roasted organic Arabica coffee beans.",
      short_description: "Rich aroma and smooth flavor.",
      price: 15.99,
      compare_price: 19.99,
      sku: "GROC-COFFEE-001",
      stock_quantity: 200,
      category: 10, // Groceries
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
      ]),
      tags: JSON.stringify(["coffee", "organic", "beverage", "grocery"]),
      status: "active",
    },
    {
      name: "Almond Milk",
      slug: "almond-milk",
      description: "Vegan-friendly almond milk, unsweetened.",
      short_description: "Healthy dairy alternative.",
      price: 3.99,
      compare_price: 4.99,
      sku: "GROC-MILK-001",
      stock_quantity: 120,
      category: 10,
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1621955964441-d1691a7f4c08",
      ]),
      tags: JSON.stringify(["milk", "vegan", "dairy-free", "grocery"]),
      status: "active",
    },
    {
      name: "Office Chair",
      slug: "office-chair",
      description:
        "Ergonomic office chair with lumbar support and adjustable height.",
      short_description: "Comfortable chair for long work hours.",
      price: 189.99,
      compare_price: 229.99,
      sku: "OFFICE-CHAIR-001",
      stock_quantity: 45,
      category: 11, // Office Supplies
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1598300056393-4f7e88a0b5f3",
      ]),
      tags: JSON.stringify(["office", "chair", "furniture", "ergonomic"]),
      status: "active",
    },
    {
      name: "Wireless Printer",
      slug: "wireless-printer",
      description:
        "All-in-one wireless printer with scanning and copying functions.",
      short_description: "Compact and efficient printer for home and office.",
      price: 129.99,
      compare_price: 149.99,
      sku: "OFFICE-PRINTER-001",
      stock_quantity: 30,
      category: 11,
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1587825140708-6cdb27b3d5fc",
      ]),
      tags: JSON.stringify(["printer", "office", "wireless", "scanning"]),
      status: "active",
    },
    {
      name: "Wooden Dining Table",
      slug: "wooden-dining-table",
      description: "Solid oak wooden dining table that seats up to 6 people.",
      short_description: "Durable and stylish dining furniture.",
      price: 699.99,
      compare_price: 799.99,
      sku: "FURN-001",
      stock_quantity: 20,
      category: 12, // Furniture
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      ]),
      tags: JSON.stringify(["furniture", "table", "wood", "dining"]),
      status: "active",
    },
    {
      name: "Acoustic Guitar",
      slug: "acoustic-guitar",
      description: "Full-size acoustic guitar with premium wood finish.",
      short_description: "Perfect for beginners and professionals.",
      price: 249.99,
      compare_price: 299.99,
      sku: "MUSIC-GUITAR-001",
      stock_quantity: 35,
      category: 13, // Music & Instruments
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
      ]),
      tags: JSON.stringify(["music", "guitar", "acoustic", "instrument"]),
      status: "active",
    },
    {
      name: "Dog Bed",
      slug: "dog-bed",
      description: "Comfortable plush bed for small to large dogs.",
      short_description: "Soft and durable pet bed.",
      price: 59.99,
      compare_price: 79.99,
      sku: "PET-BED-001",
      stock_quantity: 60,
      category: 14, // Pet Supplies
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1628470520167-38cd3744d2f6",
      ]),
      tags: JSON.stringify(["dog", "pet", "bed", "plush"]),
      status: "active",
    },
    {
      name: "Baby Stroller",
      slug: "baby-stroller",
      description: "Lightweight stroller with adjustable canopy and storage.",
      short_description: "Safe and comfortable stroller for babies.",
      price: 199.99,
      compare_price: 249.99,
      sku: "BABY-STROLLER-001",
      stock_quantity: 40,
      category: 15, // Baby & Kids
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1612197526769-4f29ad26a635",
      ]),
      tags: JSON.stringify(["baby", "stroller", "kids", "care"]),
      status: "active",
    },
    {
      name: "Travel Backpack",
      slug: "travel-backpack",
      description: "Durable waterproof backpack for travel and hiking.",
      short_description: "Spacious backpack with multiple compartments.",
      price: 89.99,
      compare_price: 109.99,
      sku: "TRAVEL-BACKPACK-001",
      stock_quantity: 75,
      category: 16, // Travel & Luggage
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6",
      ]),
      tags: JSON.stringify(["travel", "backpack", "bag", "hiking"]),
      status: "active",
    },
    {
      name: "Acrylic Paint Set",
      slug: "acrylic-paint-set",
      description: "Set of 24 acrylic paints for artists and hobbyists.",
      short_description: "High-quality paints with vibrant colors.",
      price: 34.99,
      compare_price: 44.99,
      sku: "ART-PAINT-001",
      stock_quantity: 90,
      category: 17, // Art & Crafts
      seller: 0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1580910051074-3f59c84b6ef3",
      ]),
      tags: JSON.stringify(["art", "paint", "acrylic", "craft"]),
      status: "active",
    },
    {
      name: "Movie Collector Blu-ray Set",
      slug: "movie-collector-bluray",
      description:
        "Exclusive collector's edition Blu-ray set of popular movies.",
      short_description: "High-definition movies in a premium box set.",
      price: 99.99,
      compare_price: 129.99,
      sku: "MOVIE-BLURAY-001",
      stock_quantity: 50,
      category: 18, // Movies & Entertainment
      seller: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1588776814546-3dfaec0b5b41",
      ]),
      tags: JSON.stringify(["movies", "blu-ray", "entertainment", "collector"]),
      status: "active",
    },
    {
      name: "PlayStation 5",
      slug: "playstation-5",
      description:
        "Sony PlayStation 5 console with ultra-fast SSD and 4K gaming.",
      short_description: "Next-gen gaming console.",
      price: 499.99,
      compare_price: 549.99,
      sku: "GAME-PS5-001",
      stock_quantity: 30,
      category: 19, // Gaming
      seller: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1606813902919-379a77a64b06",
      ]),
      tags: JSON.stringify(["gaming", "console", "playstation", "sony"]),
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
      ON CONFLICT (order_number) DO UPDATE SET
        status = $3, payment_status = $4
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
