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

async function cleanupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Starting database cleanup...\n');
    
    await client.query('BEGIN');
    
    // Get counts before deletion
    const [ordersCount, orderItemsCount, usersCount, addressesCount, whatsappOrdersCount, whatsappOrderItemsCount, whatsappSessionsCount] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM orders'),
      client.query('SELECT COUNT(*) as count FROM order_items'),
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM user_addresses'),
      client.query('SELECT COUNT(*) as count FROM whatsapp_orders'),
      client.query('SELECT COUNT(*) as count FROM whatsapp_order_items'),
      client.query('SELECT COUNT(*) as count FROM whatsapp_sessions'),
    ]);
    
    const ordersBefore = parseInt(ordersCount.rows[0].count);
    const orderItemsBefore = parseInt(orderItemsCount.rows[0].count);
    const usersBefore = parseInt(usersCount.rows[0].count);
    const addressesBefore = parseInt(addressesCount.rows[0].count);
    const whatsappOrdersBefore = parseInt(whatsappOrdersCount.rows[0].count);
    const whatsappOrderItemsBefore = parseInt(whatsappOrderItemsCount.rows[0].count);
    const whatsappSessionsBefore = parseInt(whatsappSessionsCount.rows[0].count);
    
    console.log('📊 Current database state:');
    console.log(`   Orders: ${ordersBefore}`);
    console.log(`   Order Items: ${orderItemsBefore}`);
    console.log(`   Users: ${usersBefore}`);
    console.log(`   User Addresses: ${addressesBefore}`);
    console.log(`   WhatsApp Orders: ${whatsappOrdersBefore}`);
    console.log(`   WhatsApp Order Items: ${whatsappOrderItemsBefore}`);
    console.log(`   WhatsApp Sessions: ${whatsappSessionsBefore}\n`);
    
    // Delete in correct order to handle foreign key constraints
    console.log('🗑️  Deleting data...\n');
    
    // 1. Delete order items first (references orders)
    console.log('   Deleting order items...');
    const orderItemsResult = await client.query('DELETE FROM order_items');
    console.log(`   ✅ Deleted ${orderItemsResult.rowCount} order items`);
    
    // 2. Delete orders (references users)
    console.log('   Deleting orders...');
    const ordersResult = await client.query('DELETE FROM orders');
    console.log(`   ✅ Deleted ${ordersResult.rowCount} orders`);
    
    // 3. Delete user addresses (references users)
    console.log('   Deleting user addresses...');
    const addressesResult = await client.query('DELETE FROM user_addresses');
    console.log(`   ✅ Deleted ${addressesResult.rowCount} user addresses`);
    
    // 4. Delete WhatsApp order items (references whatsapp_orders)
    console.log('   Deleting WhatsApp order items...');
    const whatsappOrderItemsResult = await client.query('DELETE FROM whatsapp_order_items');
    console.log(`   ✅ Deleted ${whatsappOrderItemsResult.rowCount} WhatsApp order items`);
    
    // 5. Delete WhatsApp orders
    console.log('   Deleting WhatsApp orders...');
    const whatsappOrdersResult = await client.query('DELETE FROM whatsapp_orders');
    console.log(`   ✅ Deleted ${whatsappOrdersResult.rowCount} WhatsApp orders`);
    
    // 6. Delete WhatsApp sessions
    console.log('   Deleting WhatsApp sessions...');
    const whatsappSessionsResult = await client.query('DELETE FROM whatsapp_sessions');
    console.log(`   ✅ Deleted ${whatsappSessionsResult.rowCount} WhatsApp sessions`);
    
    // 7. Delete users (but keep admin users if they exist)
    console.log('   Deleting users...');
    // Check if there's an admin user to preserve
    const adminCheck = await client.query(`
      SELECT id FROM users 
      WHERE phone = $1 OR email = $2 
      LIMIT 1
    `, [process.env.ADMIN_USERNAME || 'admin', process.env.ADMIN_EMAIL || 'admin@k2chicken.com']);
    
    let usersDeleted = 0;
    if (adminCheck.rows.length > 0) {
      // Delete all users except admin
      const usersResult = await client.query(`
        DELETE FROM users 
        WHERE id != $1
      `, [adminCheck.rows[0].id]);
      usersDeleted = usersResult.rowCount;
      console.log(`   ✅ Deleted ${usersDeleted} users (preserved admin user)`);
    } else {
      // Delete all users
      const usersResult = await client.query('DELETE FROM users');
      usersDeleted = usersResult.rowCount;
      console.log(`   ✅ Deleted ${usersResult.rowCount} users`);
    }
    
    // 8. Reset sequences to start from 1
    console.log('\n   Resetting sequences...');
    await client.query("SELECT setval('orders_id_seq', 1, false)");
    await client.query("SELECT setval('order_items_id_seq', 1, false)");
    await client.query("SELECT setval('users_id_seq', 1, false)");
    await client.query("SELECT setval('user_addresses_id_seq', 1, false)");
    console.log('   ✅ Sequences reset');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Database cleanup completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Orders deleted: ${ordersBefore}`);
    console.log(`   Order items deleted: ${orderItemsBefore}`);
    console.log(`   Users deleted: ${usersDeleted}`);
    console.log(`   Addresses deleted: ${addressesBefore}`);
    console.log(`   WhatsApp orders deleted: ${whatsappOrdersBefore}`);
    console.log(`   WhatsApp order items deleted: ${whatsappOrderItemsBefore}`);
    console.log(`   WhatsApp sessions deleted: ${whatsappSessionsBefore}`);
    console.log('\n✨ Database is now fresh and ready for new users!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run cleanup
cleanupDatabase()
  .then(() => {
    console.log('\n🎉 Cleanup script finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });

