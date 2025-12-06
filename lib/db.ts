import { Pool } from 'pg';

// Support both connection string (for cloud databases) and individual config (for local)
let poolConfig: any;

if (process.env.DATABASE_URL) {
  // Use connection string (preferred for cloud databases like Neon, Supabase, Railway)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  };
} else {
  // Fallback to individual config (for local development)
  poolConfig = {
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'chicken_vicken',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  };
}

// Enhanced pool configuration for better connection handling
// For serverless databases (Neon, Supabase), use more conservative settings
const isServerless = process.env.DATABASE_URL?.includes('neon.tech') || 
                     process.env.DATABASE_URL?.includes('supabase.co') ||
                     process.env.DATABASE_URL?.includes('railway.app');

const poolConfigWithRetry = {
  ...poolConfig,
  max: isServerless ? 10 : 20, // Lower max connections for serverless
  idleTimeoutMillis: isServerless ? 10000 : 30000, // Shorter timeout for serverless
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  // Handle connection errors gracefully
  allowExitOnIdle: false,
  // For serverless, close connections more aggressively
  ...(isServerless && {
    statement_timeout: 30000, // 30 second query timeout
  }),
};

const pool = new Pool(poolConfigWithRetry);

// Handle pool errors - filter out expected timeout errors
pool.on('error', (err: any) => {
  // Ignore expected timeout/reset errors on idle connections (common with serverless DBs)
  // These errors occur when idle connections are closed by the server
  const expectedErrorCodes = ['ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ENOTFOUND', 'ECONNREFUSED'];
  const isExpectedError = expectedErrorCodes.includes(err.code) || 
                          err.message?.includes('timeout') ||
                          err.message?.includes('idle client');
  
  if (isExpectedError) {
    // These are expected with serverless databases when connections idle out
    // Silently ignore - the pool will create new connections as needed
    return;
  }
  
  // Log actual unexpected errors
  console.error('❌ Unexpected database pool error:', {
    code: err.code,
    message: err.message,
    syscall: err.syscall,
  });
});

// Test connection on startup - only log once per process
// Using a symbol to ensure it's truly module-scoped
const INIT_KEY = Symbol('db-init');
if (!(globalThis as any)[INIT_KEY]) {
  (globalThis as any)[INIT_KEY] = true;
  // Test connection asynchronously without blocking
  pool.connect()
    .then((client) => {
      console.log('✅ Database connection pool initialized');
      client.release();
    })
    .catch((err) => {
      console.error('❌ Failed to initialize database connection pool:', err);
    });
}

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
        original_price DECIMAL(10,2),
        image_url VARCHAR(500),
        category VARCHAR(100),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add original_price column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='products' AND column_name='original_price') THEN
          ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
        END IF;
      END $$;
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

    // Create product_weight_options table (needed before order_items)
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

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        weight_option_id INTEGER REFERENCES product_weight_options(id),
        selected_weight DECIMAL(10,2),
        weight_unit VARCHAR(10) DEFAULT 'g',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add weight columns to order_items if they don't exist (for existing tables)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='order_items' AND column_name='weight_option_id') THEN
          ALTER TABLE order_items ADD COLUMN weight_option_id INTEGER REFERENCES product_weight_options(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='order_items' AND column_name='selected_weight') THEN
          ALTER TABLE order_items ADD COLUMN selected_weight DECIMAL(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='order_items' AND column_name='weight_unit') THEN
          ALTER TABLE order_items ADD COLUMN weight_unit VARCHAR(10) DEFAULT 'g';
        END IF;
      END $$;
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

    // Create inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 0,
        reserved_quantity INTEGER NOT NULL DEFAULT 0,
        minimum_stock_level INTEGER DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory history table for tracking changes
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_history (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('adjustment', 'delivery_deduction', 'reserved', 'released', 'stock_delivery')),
        quantity_change INTEGER NOT NULL,
        previous_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        order_id INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table for delivery configuration
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create promotions table for offer flyers
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

    // Create users table for authentication
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

    // Create user_addresses table
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

    // Create delivery_time_slots table
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

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_phone VARCHAR(20),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add stock columns to products table if they don't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='products' AND column_name='stock_quantity') THEN
          ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 100;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='products' AND column_name='low_stock_threshold') THEN
          ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='products' AND column_name='in_stock') THEN
          ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
        END IF;
      END $$;
    `);

    // Add user_id and delivery fields to orders table if they don't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='user_id') THEN
          ALTER TABLE orders ADD COLUMN user_id INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='delivery_type') THEN
          ALTER TABLE orders ADD COLUMN delivery_type VARCHAR(20) DEFAULT 'delivery';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='subtotal') THEN
          ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='delivery_charge') THEN
          ALTER TABLE orders ADD COLUMN delivery_charge DECIMAL(10,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='discount_amount') THEN
          ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='payment_method') THEN
          ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='delivery_time_slot_id') THEN
          ALTER TABLE orders ADD COLUMN delivery_time_slot_id INTEGER REFERENCES delivery_time_slots(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='preferred_delivery_date') THEN
          ALTER TABLE orders ADD COLUMN preferred_delivery_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='preferred_delivery_time') THEN
          ALTER TABLE orders ADD COLUMN preferred_delivery_time TIME;
        END IF;
      END $$;
    `);

    // Ensure user_id foreign key constraint exists and allows NULL values
    // This fixes the constraint if it was created incorrectly
    await client.query(`
      DO $$
      BEGIN
        -- Drop existing constraint if it exists (to recreate with proper NULL handling)
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_fkey') THEN
          ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END $$;
    `).catch(() => {}) // Ignore errors if constraint doesn't exist
    
    // Add constraint that properly allows NULL values
    await client.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    `).catch(() => {}) // Ignore error if constraint already exists

    // Initialize default delivery settings if they don't exist
    const settingsCount = await client.query('SELECT COUNT(*) FROM settings WHERE key = $1', ['delivery_radius_km']);
    if (parseInt(settingsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO settings (key, value, description) VALUES
        ('delivery_radius_km', '5', 'Free delivery radius in kilometers'),
        ('charge_per_km', '5', 'Delivery charge per kilometer beyond the free radius'),
        ('base_delivery_fee', '0', 'Base delivery fee (usually 0)')
      `);
    }

    // Insert sample products with actual images (original 8 products)
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, description, price, image_url, category, stock_quantity, in_stock) VALUES
        ('Chicken Breast Boneless', 'Fresh, tender boneless chicken breast - perfect for grilling or frying', 299, '/images/Chicken-Breast-Boneless.jpg', 'main', 100, true),
        ('Chicken Curry Cut', 'Traditional curry cut chicken pieces with bone - ideal for curries and stews', 249, '/images/Chicken-Curry-Cut.jpg', 'main', 100, true),
        ('Chicken Drumstick', 'Juicy chicken drumsticks - great for roasting or grilling', 219, '/images/Chicken-Drumstick.jpg', 'main', 100, true),
        ('Chicken Kheema', 'Finely minced chicken meat - perfect for kebabs and biryanis', 279, '/images/Chicken-Kheema.jpg', 'main', 100, true),
        ('Chicken Legs', 'Whole chicken legs with thigh and drumstick - excellent for roasting', 299, '/images/Chicken-Legs.jpg', 'main', 100, true),
        ('Chicken Liver', 'Fresh chicken liver - rich in iron and perfect for stir-fries', 199, '/images/Chicken-Liver.jpg', 'main', 100, true),
        ('Chicken Wings', 'Crispy chicken wings - perfect for appetizers and parties', 219, '/images/Chicken-Wings.jpg', 'appetizer', 100, true),
        ('Whole Chicken', 'Complete whole chicken - perfect for roasting and special occasions', 379, '/images/Whole-Chicken-5.jpg', 'main', 100, true)
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

    // Insert sample reviews - fewer but more insightful reviews about products and service
    const reviewCount = await client.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(reviewCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO reviews (user_name, rating, comment, is_approved, is_featured, display_order) VALUES
        ('Rajesh Kumar', 5, 'Ordered the Whole Chicken for a family dinner and it was absolutely fresh! The packaging was excellent - sealed properly and arrived cold. The chicken was clean, well-cut, and had no unpleasant odor. Delivery was exactly on time as promised. The quality is restaurant-grade and the price is very reasonable. Will definitely order again!', true, true, 1),
        ('Priya Sharma', 5, 'I''ve been ordering Chicken Curry Cut regularly for my weekly meal prep. What I love most is the consistency - every order is fresh, properly portioned, and the cuts are uniform. The delivery team is always polite and calls before arriving. The weight options (250g, 500g, 1kg) make it easy to order exactly what I need. Highly recommend for regular customers!', true, true, 2),
        ('Amit Patel', 5, 'Tried the Chicken Breast Boneless for the first time and was impressed! The meat was tender, no excess fat, and perfect for grilling. The customer service team helped me choose the right weight option. Delivery was within 30 minutes and the packaging kept everything fresh. The quality is definitely better than local meat shops. Worth every rupee!', true, true, 3),
        ('Sneha Desai', 4, 'Ordered Chicken Wings for a party and they were a hit! The wings were fresh, well-cleaned, and the perfect size. Delivery was prompt and the packaging was neat. Only minor issue was I wish there were more weight options, but overall great service. The prices are competitive and the quality is good. Will order again for special occasions.', true, true, 4),
        ('Vikram Singh', 5, 'Best online chicken service in Pune! I''ve tried multiple products - Chicken Kheema, Drumsticks, and Liver. Each one is consistently fresh and well-packaged. The delivery is always on time, and they even accommodate special delivery time requests. The customer support is responsive and helpful. The variety of cuts and weight options make meal planning easy. Highly satisfied customer!', true, true, 5)
      `);
    }

  } finally {
    client.release();
  }
}
