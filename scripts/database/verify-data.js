const { Pool } = require("pg");
require("dotenv").config();

async function verifyData() {
  console.log("🔍 Verifying seeded data...\n");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const client = await pool.connect();

    // Check users
    const usersResult = await client.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `);

    console.log("👥 Users:");
    usersResult.rows.forEach((row) => {
      console.log(`   ${row.role}: ${row.count}`);
    });

    // Check categories
    const categoriesResult = await client.query(`
      SELECT COUNT(*) as count FROM categories WHERE is_active = true
    `);
    console.log(`\n📂 Categories: ${categoriesResult.rows[0].count}`);

    // Check products
    const productsResult = await client.query(`
      SELECT p.name, p.price, c.name as category, u.first_name || ' ' || u.last_name as seller
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
      ORDER BY p.name
    `);

    console.log(`\n📦 Products (${productsResult.rows.length}):`);
    productsResult.rows.forEach((row) => {
      console.log(
        `   • ${row.name} - $${row.price} (${row.category}) by ${row.seller}`
      );
    });

    // Check orders
    const ordersResult = await client.query(`
      SELECT o.order_number, o.status, o.total_amount, u.first_name || ' ' || u.last_name as customer
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    console.log(
      `\n🛒 Recent Orders (showing 5 of ${ordersResult.rows.length}):`
    );
    ordersResult.rows.forEach((row) => {
      console.log(
        `   • ${row.order_number}: ${row.status} - $${row.total_amount} (${row.customer})`
      );
    });

    // Check reviews
    const reviewsResult = await client.query(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews
      WHERE status = 'approved'
    `);

    console.log(
      `\n⭐ Reviews: ${reviewsResult.rows[0].count} (avg rating: ${parseFloat(
        reviewsResult.rows[0].avg_rating
      ).toFixed(1)})`
    );

    // Check coupons
    const couponsResult = await client.query(`
      SELECT code, name, type, value
      FROM coupons
      WHERE is_active = true
      ORDER BY code
    `);

    console.log(`\n🎫 Active Coupons:`);
    couponsResult.rows.forEach((row) => {
      const value =
        row.type === "percentage"
          ? `${row.value}%`
          : row.type === "fixed_amount"
          ? `$${row.value}`
          : "Free Shipping";
      console.log(`   • ${row.code}: ${row.name} (${value})`);
    });

    // Sample login credentials
    console.log("\n🔑 Sample Login Credentials:");
    console.log("   Admin: admin@ecommerce.com / password123");
    console.log("   Customer: john.doe@example.com / password123");
    console.log("   Seller: tech.store@example.com / password123");

    client.release();
    await pool.end();

    console.log("\n✅ Data verification completed!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verifyData();
