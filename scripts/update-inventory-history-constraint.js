const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function updateInventoryHistoryConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('Updating inventory_history constraint to include stock_delivery...');
    
    // Drop the old constraint if it exists
    await client.query(`
      ALTER TABLE inventory_history 
      DROP CONSTRAINT IF EXISTS inventory_history_change_type_check
    `);
    
    // Add new constraint with stock_delivery
    await client.query(`
      ALTER TABLE inventory_history 
      ADD CONSTRAINT inventory_history_change_type_check 
      CHECK (change_type IN ('adjustment', 'delivery_deduction', 'reserved', 'released', 'stock_delivery'))
    `);
    
    console.log('✅ Successfully updated inventory_history constraint');
    
  } catch (error) {
    console.error('❌ Error updating constraint:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
updateInventoryHistoryConstraint()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

