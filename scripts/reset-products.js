const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function resetProducts() {
  const client = await pool.connect();
  
  try {
    console.log('Clearing existing products...');
    
    // Clear all existing products
    await client.query('DELETE FROM products');
    console.log('All existing products removed');
    
    console.log('Adding new products with updated images...');
    
    // Insert new products with proper names and images
    await client.query(`
      INSERT INTO products (name, description, price, image_url, category) VALUES
      ('Chicken Breast Boneless', 'Fresh, tender boneless chicken breast - perfect for grilling or frying', 299, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main'),
      ('Chicken Curry Cut', 'Traditional curry cut chicken pieces with bone - ideal for curries and stews', 249, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main'),
      ('Chicken Drumstick', 'Juicy chicken drumsticks - great for roasting or grilling', 219, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main'),
      ('Chicken Kheema', 'Finely minced chicken meat - perfect for kebabs and biryanis', 279, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main'),
      ('Chicken Legs', 'Whole chicken legs with thigh and drumstick - excellent for roasting', 299, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main'),
      ('Chicken Liver', 'Fresh chicken liver - rich in iron and perfect for stir-fries', 199, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main'),
      ('Chicken Wings', 'Crispy chicken wings - perfect for appetizers and parties', 219, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'appetizer'),
      ('Whole Chicken', 'Complete whole chicken - perfect for roasting and special occasions', 379, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format', 'main')
    `);
    
    console.log('New products added successfully!');
    console.log('Products now include:');
    console.log('- Chicken Breast Boneless (₹299)');
    console.log('- Chicken Curry Cut (₹249)');
    console.log('- Chicken Drumstick (₹219)');
    console.log('- Chicken Kheema (₹279)');
    console.log('- Chicken Legs (₹299)');
    console.log('- Chicken Liver (₹199)');
    console.log('- Chicken Wings (₹219)');
    console.log('- Whole Chicken (₹379)');
    
  } catch (error) {
    console.error('Error resetting products:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the reset
resetProducts()
  .then(() => {
    console.log('Product reset complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Product reset failed:', error);
    process.exit(1);
  });
