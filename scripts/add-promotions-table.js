const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function createPromotionsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating promotions table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_delivery')),
        discount_value DECIMAL(10,2),
        promo_code VARCHAR(50),
        image_url VARCHAR(500),
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Promotions table created successfully!');
  } catch (error) {
    console.error('❌ Error creating promotions table:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createPromotionsTable();

