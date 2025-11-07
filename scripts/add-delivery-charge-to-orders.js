const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "chicken_vicken",
  password: process.env.POSTGRES_PASSWORD || "password",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

async function addDeliveryChargeColumn() {
  const client = await pool.connect();

  try {
    console.log(
      "Adding delivery_charge and subtotal columns to orders table..."
    );

    // Add delivery_charge column if it doesn't exist
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'delivery'
    `);

    // Update existing orders to set subtotal = total_amount if subtotal is null
    await client.query(`
      UPDATE orders 
      SET subtotal = total_amount 
      WHERE subtotal IS NULL
    `);

    console.log("Delivery charge columns added successfully!");
  } catch (error) {
    console.error("Error adding delivery charge column:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  addDeliveryChargeColumn()
    .then(() => {
      console.log("Database update complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database update failed:", error);
      process.exit(1);
    });
}

module.exports = { addDeliveryChargeColumn };

