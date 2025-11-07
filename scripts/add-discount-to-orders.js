const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function addDiscountColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding discount_amount column to orders table...');
    
    // Check if column already exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='discount_amount'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ discount_amount column already exists!');
      return;
    }
    
    // Add discount_amount column
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0
    `);
    
    console.log('✅ discount_amount column added successfully!');
  } catch (error) {
    console.error('❌ Error adding discount_amount column:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addDiscountColumn();

