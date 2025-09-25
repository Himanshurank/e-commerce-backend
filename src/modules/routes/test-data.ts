import { Router, Request, Response } from "express";
import { DatabaseFactory } from "../../shared/factories/databaseFactory";
import { EConnectionTypes } from "../../shared/infrastructure/config/database";

const router = Router();

// Get all test products
router.get("/products", async (req: Request, res: Response) => {
  try {
    const mainDb = DatabaseFactory.getDatabase(EConnectionTypes.main);

    const { category, limit = 10, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT
        id, name, description, price, category,
        in_stock, quantity, created_at
      FROM test_products
    `;

    const params: any[] = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(Number(limit), offset);

    const result = await mainDb.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM test_products`;
    const countParams: any[] = [];

    if (category) {
      countQuery += ` WHERE category = $1`;
      countParams.push(category);
    }

    const countResult = await mainDb.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || "0");

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get product by ID
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const mainDb = DatabaseFactory.getDatabase(EConnectionTypes.main);
    const { id } = req.params;

    const query = `
      SELECT
        id, name, description, price, category,
        in_stock, quantity, created_at, updated_at
      FROM test_products
      WHERE id = $1
    `;

    const result = await mainDb.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get categories summary
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const mainDb = DatabaseFactory.getDatabase(EConnectionTypes.main);

    const query = `
      SELECT
        category,
        COUNT(*) as product_count,
        AVG(price) as avg_price,
        SUM(quantity) as total_quantity,
        COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_count
      FROM test_products
      GROUP BY category
      ORDER BY product_count DESC
    `;

    const result = await mainDb.query(query);

    const categories = result.rows.map((row) => ({
      category: row.category,
      productCount: parseInt(row.product_count),
      avgPrice: parseFloat(row.avg_price).toFixed(2),
      totalQuantity: parseInt(row.total_quantity),
      inStockCount: parseInt(row.in_stock_count),
    }));

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Search products
router.get("/search", async (req: Request, res: Response) => {
  try {
    const mainDb = DatabaseFactory.getDatabase(EConnectionTypes.main);
    const { q, minPrice, maxPrice, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query 'q' is required",
      });
    }

    let query = `
      SELECT
        id, name, description, price, category,
        in_stock, quantity
      FROM test_products
      WHERE (name ILIKE $1 OR description ILIKE $1)
    `;

    const params: any[] = [`%${q}%`];
    let paramIndex = 2;

    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    query += ` ORDER BY price ASC LIMIT $${paramIndex}`;
    params.push(Number(limit));

    const result = await mainDb.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      query: q,
      filters: {
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as testDataRouter };
