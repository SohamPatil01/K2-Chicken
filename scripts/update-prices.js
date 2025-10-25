const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function updatePrices() {
  const client = await pool.connect();
  
  try {
    console.log('Updating prices to Indian Rupees...');
    
    // Update each product with Indian Rupee prices
    const updates = [
      { name: 'Chicken Breast Boneless', price: 299 },
      { name: 'Chicken Curry Cut', price: 249 },
      { name: 'Chicken Drumstick', price: 219 },
      { name: 'Chicken Kheema', price: 279 },
      { name: 'Chicken Legs', price: 299 },
      { name: 'Chicken Liver', price: 199 },
      { name: 'Chicken Wings', price: 219 },
      { name: 'Whole Chicken', price: 379 }
    ];

    for (const update of updates) {
      await client.query(
        'UPDATE products SET price = $1 WHERE name = $2',
        [update.price, update.name]
      );
      console.log(`Updated ${update.name} to ₹${update.price}`);
    }

    console.log('All prices updated to Indian Rupees!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the update
updatePrices()
  .then(() => {
    console.log('Price update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Price update failed:', error);
    process.exit(1);
  });
