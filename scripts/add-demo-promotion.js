const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function addDemoPromotion() {
  const client = await pool.connect();
  
  try {
    console.log('Adding demo promotion...');
    
    // Check if demo promotion already exists
    const checkResult = await client.query(
      "SELECT id FROM promotions WHERE title = 'Weekend Special - 20% OFF'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Demo promotion already exists!');
      return;
    }
    
    // Add demo promotion
    const result = await client.query(`
      INSERT INTO promotions (
        title,
        description,
        discount_type,
        discount_value,
        promo_code,
        image_url,
        start_date,
        end_date,
        is_active,
        display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      'Weekend Special - 20% OFF',
      'Get 20% off on all chicken items this weekend! Order now and enjoy delicious chicken at amazing prices.',
      'percentage',
      20,
      'WEEKEND20',
      null, // No image URL for demo
      new Date().toISOString().split('T')[0], // Start today
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // End in 7 days
      true,
      1
    ]);
    
    console.log('✅ Demo promotion added successfully!');
    console.log('   Title:', result.rows[0].title);
    console.log('   Discount:', result.rows[0].discount_value + '%');
    console.log('   Promo Code:', result.rows[0].promo_code);
    console.log('   Active:', result.rows[0].is_active);
    
    // Add another demo promotion
    const result2 = await client.query(`
      INSERT INTO promotions (
        title,
        description,
        discount_type,
        discount_value,
        promo_code,
        image_url,
        start_date,
        end_date,
        is_active,
        display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      'Free Delivery on Orders Above ₹500',
      'Order now and get free delivery on all orders above ₹500. No delivery charges!',
      'free_delivery',
      null,
      'FREEDEL500',
      null,
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      true,
      2
    ]);
    
    console.log('✅ Second demo promotion added!');
    console.log('   Title:', result2.rows[0].title);
    console.log('   Type:', result2.rows[0].discount_type);
    
  } catch (error) {
    console.error('❌ Error adding demo promotion:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addDemoPromotion();

