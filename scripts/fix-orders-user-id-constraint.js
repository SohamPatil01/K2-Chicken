/**
 * Fix orders.user_id foreign key constraint to allow NULL values
 * 
 * This script fixes the foreign key constraint violation error:
 * "insert or update on table 'orders' violates foreign key constraint 'orders_user_id_fkey'"
 * 
 * Run this script if you're getting foreign key constraint errors when creating orders.
 * 
 * Usage:
 *   node scripts/fix-orders-user-id-constraint.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Try to load .env.local if it exists (simple parser, no dotenv package needed)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  });
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL in your environment or .env.local file');
  console.error('');
  console.error('You can either:');
  console.error('  1. Set it as an environment variable: export DATABASE_URL="your-connection-string"');
  console.error('  2. Or create a .env.local file with: DATABASE_URL=your-connection-string');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

async function fixConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing orders.user_id foreign key constraint...');
    
    await client.query('BEGIN');
    
    // Step 1: Drop existing constraint if it exists
    console.log('Step 1: Dropping existing constraint (if any)...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_fkey') THEN
          ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
          RAISE NOTICE 'Dropped existing constraint';
        ELSE
          RAISE NOTICE 'No existing constraint found';
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Error dropping constraint: %', SQLERRM;
      END $$;
    `);
    
    // Step 2: Ensure user_id column exists
    console.log('Step 2: Ensuring user_id column exists...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='user_id') THEN
          ALTER TABLE orders ADD COLUMN user_id INTEGER;
          RAISE NOTICE 'Added user_id column';
        ELSE
          RAISE NOTICE 'user_id column already exists';
        END IF;
      END $$;
    `);
    
    // Step 3: Add constraint that allows NULL values
    console.log('Step 3: Adding constraint with NULL support...');
    await client.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    `);
    
    // Step 4: Update any invalid user_id values to NULL
    console.log('Step 4: Cleaning up invalid user_id references...');
    const invalidUserIds = await client.query(`
      SELECT DISTINCT o.user_id 
      FROM orders o 
      WHERE o.user_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id)
    `);
    
    if (invalidUserIds.rows.length > 0) {
      console.log(`Found ${invalidUserIds.rows.length} orders with invalid user_id. Setting to NULL...`);
      await client.query(`
        UPDATE orders 
        SET user_id = NULL 
        WHERE user_id IS NOT NULL 
          AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = orders.user_id)
      `);
      console.log('✅ Cleaned up invalid user_id references');
    } else {
      console.log('✅ No invalid user_id references found');
    }
    
    await client.query('COMMIT');
    
    console.log('✅ Successfully fixed orders.user_id foreign key constraint!');
    console.log('');
    console.log('The constraint now:');
    console.log('  - Allows NULL values (for guest orders)');
    console.log('  - Sets user_id to NULL if the referenced user is deleted');
    console.log('  - Only validates user_id if it is NOT NULL');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing constraint:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixConstraint()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

