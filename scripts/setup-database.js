const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Create products table
    console.log('📦 Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(100),
        is_available BOOLEAN DEFAULT true,
        stock_quantity INTEGER DEFAULT 100,
        low_stock_threshold INTEGER DEFAULT 10,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table created\n');
    
    // Create orders table
    console.log('📋 Creating orders table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_type VARCHAR(20) DEFAULT 'delivery',
        total_amount DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2),
        delivery_charge DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        estimated_delivery TIMESTAMP,
        user_id INTEGER,
        delivery_time_slot_id INTEGER,
        preferred_delivery_date DATE,
        preferred_delivery_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table created\n');
    
    // Create order_items table
    console.log('🛒 Creating order_items table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        weight_option_id INTEGER,
        selected_weight DECIMAL(10,2),
        weight_unit VARCHAR(10) DEFAULT 'g',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Order items table created\n');
    
    // Create recipes table
    console.log('👨‍🍳 Creating recipes table...');
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
    console.log('✅ Recipes table created\n');
    
    // Create promotions table
    console.log('📊 Creating promotions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_delivery')),
        discount_value DECIMAL(10,2),
        promo_code VARCHAR(50),
        image_url VARCHAR(500),
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Promotions table created\n');
    
    // Create settings table
    console.log('⚙️ Creating settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default settings if they don't exist
    await client.query(`
      INSERT INTO settings (key, value)
      VALUES 
        ('delivery_radius_km', '5'),
        ('charge_per_km', '10'),
        ('base_delivery_fee', '0')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('✅ Settings table created\n');
    
    // Create users table
    console.log('👤 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        name VARCHAR(255),
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created\n');
    
    // Create user_addresses table
    console.log('📍 Creating user_addresses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        label VARCHAR(50) DEFAULT 'Home',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User addresses table created\n');
    
    // Create product_weight_options table
    console.log('⚖️ Creating product_weight_options table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_weight_options (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        weight DECIMAL(10,2) NOT NULL,
        weight_unit VARCHAR(10) DEFAULT 'g',
        price DECIMAL(10,2) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Product weight options table created\n');
    
    // Create delivery_time_slots table
    console.log('🕐 Creating delivery_time_slots table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_time_slots (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        available_slots INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Delivery time slots table created\n');
    
    // Add foreign key constraints if they don't exist
    console.log('🔗 Adding foreign key constraints...');
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_fkey'
        ) THEN
          ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'orders_delivery_time_slot_id_fkey'
        ) THEN
          ALTER TABLE orders ADD CONSTRAINT orders_delivery_time_slot_id_fkey 
          FOREIGN KEY (delivery_time_slot_id) REFERENCES delivery_time_slots(id);
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'order_items_weight_option_id_fkey'
        ) THEN
          ALTER TABLE order_items ADD CONSTRAINT order_items_weight_option_id_fkey 
          FOREIGN KEY (weight_option_id) REFERENCES product_weight_options(id);
        END IF;
      END $$;
    `);
    console.log('✅ Foreign keys added\n');
    
    // Insert sample products if none exist
    console.log('🍗 Adding sample products...');
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      // Use available images or fallback to placeholder
      await client.query(`
        INSERT INTO products (name, description, price, image_url, category, stock_quantity, in_stock) VALUES
        ('Chicken Breast Boneless', 'Fresh, tender boneless chicken breast - perfect for grilling or frying', 299, '/images/upload/Chicken-Curry-Cut.jpg', 'main', 100, true),
        ('Chicken Curry Cut', 'Traditional curry cut chicken pieces with bone - ideal for curries and stews', 249, '/images/Chicken-Curry-Cut.jpg', 'main', 100, true),
        ('Chicken Drumstick', 'Juicy chicken drumsticks - great for roasting or grilling', 219, '/images/Chicken-Curry-Cut.jpg', 'main', 100, true),
        ('Chicken Kheema', 'Finely minced chicken meat - perfect for kebabs and biryanis', 279, '/images/Chicken-Kheema.jpg', 'main', 100, true),
        ('Chicken Legs', 'Whole chicken legs with thigh and drumstick - excellent for roasting', 299, '/images/Chicken-Legs.jpg', 'main', 100, true),
        ('Chicken Liver', 'Fresh chicken liver - rich in iron and perfect for stir-fries', 199, '/images/Chicken-Liver.jpg', 'main', 100, true),
        ('Chicken Wings', 'Crispy chicken wings - perfect for appetizers and parties', 219, '/images/Chicken-Wings.jpg', 'appetizer', 100, true),
        ('Whole Chicken', 'Complete whole chicken - perfect for roasting and special occasions', 379, '/images/Whole-Chicken-5.jpg', 'main', 100, true)
      `);
      console.log('✅ Sample products added\n');
      console.log('   Note: You can update product images from the admin panel\n');
    } else {
      console.log('✅ Products already exist\n');
    }
    
    // Add default weight options to existing products
    console.log('⚖️ Adding default weight options to products...');
    const products = await client.query('SELECT id, price FROM products WHERE id IS NOT NULL');
    
    for (const product of products.rows) {
      const existing = await client.query(
        'SELECT COUNT(*) FROM product_weight_options WHERE product_id = $1',
        [product.id]
      );
      
      if (parseInt(existing.rows[0].count) === 0) {
        const basePrice = parseFloat(product.price);
        await client.query(`
          INSERT INTO product_weight_options (product_id, weight, weight_unit, price, is_default)
          VALUES 
            ($1, 250, 'g', $2, false),
            ($1, 500, 'g', $3, true),
            ($1, 1000, 'g', $4, false)
        `, [
          product.id,
          basePrice * 0.25,
          basePrice * 0.5,
          basePrice
        ]);
      }
    }
    console.log('✅ Weight options added\n');
    
    // Add demo promotions if none exist
    console.log('🎁 Adding demo promotions...');
    const promoCheck = await client.query('SELECT COUNT(*) FROM promotions');
    if (parseInt(promoCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO promotions (title, description, discount_type, discount_value, promo_code, start_date, end_date, is_active, display_order)
        VALUES 
          ('Weekend Special - 20% OFF', 'Get 20% off on all chicken items this weekend! Order now and enjoy delicious chicken at amazing prices.', 'percentage', 20, 'WEEKEND20', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true, 1),
          ('Free Delivery on Orders Above ₹500', 'Order now and get free delivery on all orders above ₹500. No delivery charges!', 'free_delivery', NULL, 'FREEDEL500', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', true, 2)
      `);
      console.log('✅ Demo promotions added\n');
    } else {
      console.log('✅ Promotions already exist\n');
    }
    
    // Add default delivery time slots for next 7 days
    console.log('🕐 Adding default delivery time slots...');
    const slotCheck = await client.query('SELECT COUNT(*) FROM delivery_time_slots WHERE date >= CURRENT_DATE');
    if (parseInt(slotCheck.rows[0].count) === 0) {
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        await client.query(`
          INSERT INTO delivery_time_slots (date, start_time, end_time, available_slots, is_active)
          VALUES 
            ($1, '10:00:00', '12:00:00', 10, true),
            ($1, '12:00:00', '14:00:00', 10, true),
            ($1, '14:00:00', '16:00:00', 10, true),
            ($1, '16:00:00', '18:00:00', 10, true),
            ($1, '18:00:00', '20:00:00', 10, true)
        `, [dateStr]);
      }
      console.log('✅ Delivery time slots added\n');
    } else {
      console.log('✅ Delivery time slots already exist\n');
    }
    
    // Insert sample recipes if none exist
    console.log('👨‍🍳 Adding sample recipes...');
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
      console.log('✅ Sample recipes added\n');
    } else {
      console.log('✅ Recipes already exist\n');
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000');
    console.log('   3. Promotions should now be visible on the homepage!');
    console.log('   4. Product images should load from /images/ directory\n');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
