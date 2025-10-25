import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export default pool;

// Database schema initialization
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
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

    // Create WhatsApp user sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        state VARCHAR(100) DEFAULT 'START',
        session_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WhatsApp orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL UNIQUE,
        user_id VARCHAR(255) NOT NULL,
        external_order_id VARCHAR(50),
        order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
        delivery_address TEXT,
        contact_phone VARCHAR(20),
        payment_method VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')),
        estimated_completion TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WhatsApp order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES whatsapp_orders(order_id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WhatsApp message logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_message_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('incoming', 'outgoing')),
        message_content TEXT NOT NULL,
        message_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample products
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, description, price, image_url, category) VALUES
        ('Classic Fried Chicken', 'Crispy golden fried chicken with our secret blend of herbs and spices', 12.99, '/images/classic-fried-chicken.jpg', 'main'),
        ('Spicy Buffalo Wings', 'Hot and spicy buffalo wings with tangy sauce', 9.99, '/images/buffalo-wings.jpg', 'appetizer'),
        ('Grilled Chicken Breast', 'Tender grilled chicken breast with herbs', 11.99, '/images/grilled-chicken.jpg', 'main'),
        ('Chicken Tenders', 'Crispy chicken tenders perfect for dipping', 8.99, '/images/chicken-tenders.jpg', 'appetizer'),
        ('Chicken Sandwich', 'Juicy chicken breast in a brioche bun with lettuce and tomato', 10.99, '/images/chicken-sandwich.jpg', 'main'),
        ('Chicken Nuggets', 'Bite-sized crispy chicken nuggets', 6.99, '/images/chicken-nuggets.jpg', 'appetizer')
      `);
    }

    // Insert sample recipes
    const recipeCount = await client.query('SELECT COUNT(*) FROM recipes');
    if (parseInt(recipeCount.rows[0].count) === 0) {
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

  } finally {
    client.release();
  }
}
