const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function updateOrdersSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Adding new columns to orders table...');
    
    // Add source column to track order origin
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'website'
    `);
    
    // Add whatsapp_user_id column to link WhatsApp orders
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS whatsapp_user_id VARCHAR(255)
    `);
    
    // Add status column if it doesn't exist
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
    `);
    
    // Create index for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_whatsapp_user_id ON orders(whatsapp_user_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source)
    `);
    
    console.log('✅ Orders table schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating orders schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateOrdersSchema().catch(console.error);
