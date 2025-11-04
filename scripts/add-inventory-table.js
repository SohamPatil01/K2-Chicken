const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function addInventoryTable() {
  const client = await pool.connect();
  
  try {
    console.log('Adding inventory table...');
    
    // Create inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 0,
        reserved_quantity INTEGER NOT NULL DEFAULT 0,
        minimum_stock_level INTEGER DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory history table for tracking changes
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_history (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('adjustment', 'delivery_deduction', 'reserved', 'released')),
        quantity_change INTEGER NOT NULL,
        previous_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        order_id INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize inventory for existing products with default quantity
    const productsResult = await client.query('SELECT id FROM products');
    for (const product of productsResult.rows) {
      const inventoryCheck = await client.query(
        'SELECT id FROM inventory WHERE product_id = $1',
        [product.id]
      );
      
      if (inventoryCheck.rows.length === 0) {
        await client.query(
          'INSERT INTO inventory (product_id, quantity, minimum_stock_level) VALUES ($1, $2, $3)',
          [product.id, 100, 10]
        );
        console.log(`Initialized inventory for product ID ${product.id} with quantity 100`);
      }
    }

    console.log('Inventory table created successfully!');
    
  } catch (error) {
    console.error('Error adding inventory table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  addInventoryTable()
    .then(() => {
      console.log('Inventory setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Inventory setup failed:', error);
      process.exit(1);
    });
}

module.exports = { addInventoryTable };

