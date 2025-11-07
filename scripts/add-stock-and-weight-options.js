const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function addStockAndWeightOptions() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add stock-related columns to products table
    console.log('Adding stock columns to products table...');
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
      ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true
    `);

    // Create product_weight_options table
    console.log('Creating product_weight_options table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_weight_options (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        weight DECIMAL(10,2) NOT NULL,
        weight_unit VARCHAR(10) DEFAULT 'g',
        price DECIMAL(10,2) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add weight option to order_items
    console.log('Adding weight option to order_items...');
    await client.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS weight_option_id INTEGER REFERENCES product_weight_options(id),
      ADD COLUMN IF NOT EXISTS selected_weight DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'g'
    `);

    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        name VARCHAR(255),
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_addresses table
    console.log('Creating user_addresses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        label VARCHAR(50) DEFAULT 'Home',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add user_id to orders table
    console.log('Adding user_id to orders table...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);

    // Create delivery_time_slots table
    console.log('Creating delivery_time_slots table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_time_slots (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        available_slots INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add delivery_time_slot_id to orders
    console.log('Adding delivery_time_slot_id to orders...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS delivery_time_slot_id INTEGER REFERENCES delivery_time_slots(id),
      ADD COLUMN IF NOT EXISTS preferred_delivery_date DATE,
      ADD COLUMN IF NOT EXISTS preferred_delivery_time TIME
    `);

    // Insert default weight options for existing products (250g, 500g, 1kg)
    console.log('Adding default weight options to existing products...');
    const products = await client.query('SELECT id, price FROM products WHERE id IS NOT NULL');
    
    for (const product of products.rows) {
      const basePrice = parseFloat(product.price);
      
      // Check if weight options already exist
      const existing = await client.query(
        'SELECT COUNT(*) FROM product_weight_options WHERE product_id = $1',
        [product.id]
      );
      
      if (parseInt(existing.rows[0].count) === 0) {
        // Insert weight options: 250g, 500g, 1kg
        await client.query(`
          INSERT INTO product_weight_options (product_id, weight, weight_unit, price, is_default)
          VALUES 
            ($1, 250, 'g', $2, false),
            ($1, 500, 'g', $3, true),
            ($1, 1000, 'g', $4, false)
        `, [
          product.id,
          basePrice * 0.25, // 250g price
          basePrice * 0.5,  // 500g price (default)
          basePrice        // 1kg price
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Successfully added stock and weight options!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addStockAndWeightOptions();

