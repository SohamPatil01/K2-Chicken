const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ...(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  } : {})
});

async function updateProductImages() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating products with correct image URLs...\n');
    
    // Product image mappings - using images from /public/images/ folder
    const productUpdates = [
      {
        name: 'Chicken Breast Boneless',
        image_url: '/images/Chicken-Breast-Boneless.jpg'
      },
      {
        name: 'Chicken Curry Cut',
        image_url: '/images/Chicken-Curry-Cut.jpg'
      },
      {
        name: 'Chicken Drumstick',
        image_url: '/images/Chicken-Drumstick.jpg'
      },
      {
        name: 'Chicken Kheema',
        image_url: '/images/Chicken-Kheema.jpg'
      },
      {
        name: 'Chicken Legs',
        image_url: '/images/Chicken-Legs.jpg'
      },
      {
        name: 'Chicken Liver',
        image_url: '/images/Chicken-Liver.jpg'
      },
      {
        name: 'Chicken Wings',
        image_url: '/images/Chicken-Wings.jpg'
      },
      {
        name: 'Whole Chicken',
        image_url: '/images/Whole-Chicken-5.jpg'
      }
    ];

    const results = [];
    let updated = 0;
    let notFound = 0;

    for (const product of productUpdates) {
      try {
        // Check if product exists
        const existing = await client.query(
          'SELECT id, name, image_url FROM products WHERE name = $1',
          [product.name]
        );

        if (existing.rows.length > 0) {
          const currentImage = existing.rows[0].image_url;
          // Update existing product
          await client.query(
            'UPDATE products SET image_url = $1 WHERE name = $2',
            [product.image_url, product.name]
          );
          updated++;
          results.push({ 
            name: product.name, 
            action: 'updated', 
            image_url: product.image_url,
            previous: currentImage
          });
          console.log(`✅ Updated: ${product.name}`);
          console.log(`   Image: ${product.image_url}`);
          if (currentImage !== product.image_url) {
            console.log(`   Previous: ${currentImage || 'none'}`);
          }
        } else {
          notFound++;
          results.push({ name: product.name, action: 'not_found' });
          console.log(`⚠️  Not found: ${product.name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ name: product.name, action: 'error', error: errorMessage });
        console.error(`❌ Error updating ${product.name}:`, errorMessage);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    console.log(`   ❌ Errors: ${results.filter(r => r.action === 'error').length}`);
    
    return {
      success: true,
      updated,
      notFound,
      results
    };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
updateProductImages()
  .then(() => {
    console.log('\n✨ Product images update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to update product images:', error);
    process.exit(1);
  });

