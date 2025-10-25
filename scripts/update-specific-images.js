const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function updateSpecificImages() {
  const client = await pool.connect();
  
  try {
    console.log('Updating products with specific chicken images...');
    
    // Update each product with specific high-quality chicken images
    const updates = [
      {
        name: 'Chicken Breast Boneless',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Chicken Curry Cut', 
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Chicken Drumstick',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Chicken Kheema',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Chicken Legs',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Chicken Liver',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Chicken Wings',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      },
      {
        name: 'Whole Chicken',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&auto=format'
      }
    ];

    for (const update of updates) {
      await client.query(
        'UPDATE products SET image_url = $1 WHERE name = $2',
        [update.image_url, update.name]
      );
      console.log(`Updated ${update.name} with specific chicken image`);
    }

    console.log('All products updated with specific chicken images!');
    
  } catch (error) {
    console.error('Error updating images:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the update
updateSpecificImages()
  .then(() => {
    console.log('Specific image update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Specific image update failed:', error);
    process.exit(1);
  });
