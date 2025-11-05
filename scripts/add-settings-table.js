const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "chicken_vicken",
  password: process.env.POSTGRES_PASSWORD || "password",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

async function addSettingsTable() {
  const client = await pool.connect();

  try {
    console.log("Creating settings table...");

    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize default delivery settings if they don't exist
    const settingsCount = await client.query(
      "SELECT COUNT(*) FROM settings WHERE key = $1",
      ["delivery_radius_km"]
    );
    if (parseInt(settingsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO settings (key, value, description) VALUES
        ('delivery_radius_km', '5', 'Free delivery radius in kilometers'),
        ('charge_per_km', '5', 'Delivery charge per kilometer beyond the free radius'),
        ('base_delivery_fee', '0', 'Base delivery fee (usually 0)')
      `);
      console.log("Default delivery settings initialized");
    } else {
      console.log("Settings table already has default values");
    }

    console.log("Settings table created successfully!");
  } catch (error) {
    console.error("Error adding settings table:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  addSettingsTable()
    .then(() => {
      console.log("Settings setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Settings setup failed:", error);
      process.exit(1);
    });
}

module.exports = { addSettingsTable };
