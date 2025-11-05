const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Map product names to image paths
const productImageMap = {
  'Chicken Breast Boneless': '/images/upload/1761282105435-Chicken-Breast-Boneless.-2 copy.jpg',
  'Chicken Curry Cut': '/images/Chicken-Curry-Cut.jpg',
  'Chicken Drumstick': '/images/upload/1761282158358-Chicken-Drumstick-3 copy.jpg',
  'Chicken Kheema': '/images/Chicken-Kheema.jpg',
  'Chicken Legs': '/images/Chicken-Legs.jpg',
  'Chicken Liver': '/images/Chicken-Liver.jpg',
  'Whole Chicken': '/images/Whole-Chicken-5.jpg',
  'Chicken Wings': '/images/Chicken-Wings.jpg',
};

async function updateProductImages() {
  const client = await pool.connect();
  
  try {
    console.log('Updating product images...');
    
    for (const [productName, imagePath] of Object.entries(productImageMap)) {
      const result = await client.query(
        'UPDATE products SET image_url = $1 WHERE name = $2 RETURNING name',
        [imagePath, productName]
      );
      
      if (result.rows.length > 0) {
        console.log(`✓ Updated ${productName} with image: ${imagePath}`);
      } else {
        console.log(`⚠ Product not found: ${productName}`);
      }
    }
    
    console.log('Product images updated successfully!');
  } catch (error) {
    console.error('Error updating product images:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run update if this script is executed directly
if (require.main === module) {
  updateProductImages()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { updateProductImages };

