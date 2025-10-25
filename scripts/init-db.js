const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Initializing Chicken Vicken database...');
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(100),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        estimated_delivery TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recipes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT[] NOT NULL,
        instructions TEXT[] NOT NULL,
        image_url VARCHAR(500),
        prep_time INTEGER,
        cook_time INTEGER,
        servings INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample products
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      console.log('Inserting sample products...');
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
    }

    // Insert sample recipes
    const recipeCount = await client.query('SELECT COUNT(*) FROM recipes');
    if (parseInt(recipeCount.rows[0].count) === 0) {
      console.log('Inserting sample recipes...');
      await client.query(`
        INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings) VALUES
        ('Perfect Fried Chicken', 'Learn to make crispy, golden fried chicken at home', 
         ARRAY['4 chicken thighs', '2 cups all-purpose flour', '1 tsp salt', '1 tsp black pepper', '1 tsp paprika', '1 tsp garlic powder', '2 eggs', '1 cup buttermilk', 'Oil for frying'],
         ARRAY['Mix flour with salt, pepper, paprika, and garlic powder in a bowl', 'Beat eggs with buttermilk in another bowl', 'Dip chicken in egg mixture, then flour mixture', 'Heat oil to 350°F and fry chicken for 12-15 minutes until golden', 'Drain on paper towels and serve hot'],
         15, 20, 4),
        ('Honey Garlic Chicken', 'Sweet and savory chicken with honey garlic glaze',
         ARRAY['4 chicken breasts', '1/4 cup honey', '3 cloves garlic', '2 tbsp soy sauce', '1 tbsp olive oil', 'Salt and pepper to taste'],
         ARRAY['Season chicken with salt and pepper', 'Heat oil in pan and cook chicken 6-7 minutes per side', 'Mix honey, garlic, and soy sauce', 'Add sauce to pan and cook 2-3 minutes until glazed', 'Serve with rice or vegetables'],
         10, 20, 4)
      `);
    }

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
