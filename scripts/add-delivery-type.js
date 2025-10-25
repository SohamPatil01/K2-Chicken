const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function addDeliveryType() {
  const client = await pool.connect();
  
  try {
    console.log('Adding delivery_type column to orders table...');
    
    // Add delivery_type column to orders table
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'delivery'
    `);
    
    console.log('✅ Successfully added delivery_type column to orders table');
    
  } catch (error) {
    console.error('❌ Error adding delivery_type column:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addDeliveryType();
