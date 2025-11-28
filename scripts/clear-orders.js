const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Manual .env.local parser
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, value] = trimmedLine.split("=");
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnv();

// Support both connection string and individual config
let poolConfig;
if (process.env.DATABASE_URL) {
  // Check if SSL is required
  const requiresSSL =
    process.env.DATABASE_URL.includes("sslmode=require") ||
    process.env.DATABASE_URL.includes("neon.tech") ||
    process.env.DATABASE_URL.includes("supabase.co");

  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: requiresSSL ? { rejectUnauthorized: false } : undefined,
  };
} else {
  poolConfig = {
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "chicken_vicken",
    password: process.env.POSTGRES_PASSWORD || "password",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
  };
}

const pool = new Pool(poolConfig);

async function clearOrders() {
  const client = await pool.connect();

  try {
    console.log("🗑️  Starting to clear all orders...");

    await client.query("BEGIN");

    // Get count before deletion
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM orders"
    );
    const orderCount = parseInt(countResult.rows[0].count);

    console.log(`📊 Found ${orderCount} order(s) to delete`);

    if (orderCount === 0) {
      console.log("✅ No orders to delete. Database is already clean.");
      await client.query("COMMIT");
      return;
    }

    // Delete order_items first (though CASCADE should handle this, being explicit)
    const orderItemsResult = await client.query(
      "DELETE FROM order_items RETURNING id"
    );
    console.log(`   Deleted ${orderItemsResult.rows.length} order item(s)`);

    // Delete orders (this will also cascade delete order_items if CASCADE is set)
    const ordersResult = await client.query("DELETE FROM orders RETURNING id");
    console.log(`   Deleted ${ordersResult.rows.length} order(s)`);

    // Also clear inventory_history that references orders
    const inventoryHistoryResult = await client.query(
      "DELETE FROM inventory_history WHERE order_id IS NOT NULL RETURNING id"
    );
    console.log(
      `   Deleted ${inventoryHistoryResult.rows.length} inventory history record(s) related to orders`
    );

    await client.query("COMMIT");

    console.log("✅ Successfully cleared all orders from the database!");
    console.log(`   Total orders deleted: ${ordersResult.rows.length}`);
    console.log(
      `   Total order items deleted: ${orderItemsResult.rows.length}`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error clearing orders:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

clearOrders()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to clear orders:", error);
    process.exit(1);
  });
