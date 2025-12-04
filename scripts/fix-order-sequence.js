const { Pool } = require('pg');

// Support both connection string and individual config
let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') 
      ? { rejectUnauthorized: false } 
      : undefined,
  };
} else {
  poolConfig = {
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'chicken_vicken',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  };
}

const pool = new Pool(poolConfig);

async function fixOrderSequence() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking current database state...\n');
    
    // Check current orders
    const ordersResult = await client.query('SELECT COUNT(*) as count, MAX(id) as max_id FROM orders');
    const orderCount = parseInt(ordersResult.rows[0].count);
    const maxOrderId = ordersResult.rows[0].max_id ? parseInt(ordersResult.rows[0].max_id) : 0;
    
    // Check current sequence value
    const seqResult = await client.query("SELECT last_value, is_called FROM orders_id_seq");
    const lastValue = parseInt(seqResult.rows[0].last_value);
    const isCalled = seqResult.rows[0].is_called;
    
    console.log('📊 Current State:');
    console.log(`   Orders in database: ${orderCount}`);
    console.log(`   Max order ID: ${maxOrderId || 'N/A'}`);
    console.log(`   Sequence last_value: ${lastValue}`);
    console.log(`   Sequence is_called: ${isCalled}`);
    console.log(`   Next order ID will be: ${isCalled ? lastValue + 1 : lastValue}\n`);
    
    // Determine what the sequence should be
    let nextOrderId;
    if (orderCount === 0) {
      // No orders, reset to 1
      nextOrderId = 1;
      console.log('✅ No orders found. Resetting sequence to 1...');
    } else {
      // Orders exist, set to max + 1
      nextOrderId = maxOrderId + 1;
      console.log(`⚠️  Found ${orderCount} orders. Setting sequence to ${nextOrderId} (max ID + 1)...`);
    }
    
    // Reset the sequence
    await client.query(`SELECT setval('orders_id_seq', ${nextOrderId}, false)`);
    
    // Verify the reset
    const verifyResult = await client.query("SELECT last_value, is_called FROM orders_id_seq");
    const newLastValue = parseInt(verifyResult.rows[0].last_value);
    
    console.log(`\n✅ Sequence reset complete!`);
    console.log(`   New sequence value: ${newLastValue}`);
    console.log(`   Next order ID will be: ${newLastValue}\n`);
    
    // Show all current orders
    if (orderCount > 0) {
      const allOrders = await client.query('SELECT id, customer_name, created_at FROM orders ORDER BY id');
      console.log('📋 Current Orders:');
      allOrders.rows.forEach(order => {
        console.log(`   Order #${order.id}: ${order.customer_name} (${new Date(order.created_at).toLocaleString()})`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run fix
fixOrderSequence()
  .then(() => {
    console.log('🎉 Sequence fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

