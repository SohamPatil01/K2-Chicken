const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

// Local database connection (from .env.local)
const localPool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Cloud database connection (from DATABASE_URL)
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL in your .env.local file');
  process.exit(1);
}

const cloudPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

async function migrateData() {
  const localClient = await localPool.connect();
  const cloudClient = await cloudPool.connect();

  try {
    console.log('🚀 Starting data migration from local to cloud database...\n');

    // List of tables to migrate (in order to respect foreign keys)
    const tables = [
      'products',
      'users',
      'user_addresses',
      'recipes',
      'promotions',
      'settings',
      'delivery_time_slots',
      'product_weight_options',
      'inventory',
      'orders',
      'order_items',
      'whatsapp_sessions',
      'whatsapp_orders',
      'whatsapp_order_items',
      'whatsapp_message_logs',
      'inventory_history'
    ];

    for (const tableName of tables) {
      try {
        // Check if table exists in local database
        const tableExists = await localClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [tableName]);

        if (!tableExists.rows[0].exists) {
          console.log(`⏭️  Skipping ${tableName} (doesn't exist in local database)`);
          continue;
        }

        // Get all data from local table
        const result = await localClient.query(`SELECT * FROM ${tableName}`);
        const rows = result.rows;

        if (rows.length === 0) {
          console.log(`⏭️  Skipping ${tableName} (no data)`);
          continue;
        }

        console.log(`📦 Migrating ${tableName} (${rows.length} rows)...`);

        // Get available columns in cloud database
        const cloudColumnsResult = await cloudClient.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [tableName]);
        const availableCloudColumns = new Set(cloudColumnsResult.rows.map(r => r.column_name));

        // Get column names from local data, but filter to only those that exist in cloud
        const allColumns = Object.keys(rows[0]);
        const columns = allColumns.filter(col => availableCloudColumns.has(col));
        
        if (columns.length === 0) {
          console.log(`   ⚠️  No matching columns found, skipping ${tableName}`);
          continue;
        }

        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        // Insert data into cloud database
        let inserted = 0;
        let skipped = 0;

        for (const row of rows) {
          try {
            const values = columns.map(col => row[col]);
            
            // Use ON CONFLICT DO NOTHING to avoid duplicates
            await cloudClient.query(`
              INSERT INTO ${tableName} (${columnNames})
              VALUES (${placeholders})
              ON CONFLICT DO NOTHING
            `, values);
            inserted++;
          } catch (error) {
            // If it's a conflict error, skip it
            if (error.code === '23505') { // unique_violation
              skipped++;
            } else if (error.code === '23503') { // foreign_key_violation
              // Skip if foreign key constraint fails (parent record might not exist)
              skipped++;
            } else {
              // Only log non-foreign-key errors (to reduce noise)
              if (!error.message.includes('foreign key')) {
                console.error(`   ⚠️  Error inserting row into ${tableName}:`, error.message);
              }
              skipped++;
            }
          }
        }

        console.log(`   ✅ Inserted ${inserted} rows, skipped ${skipped} duplicates\n`);
      } catch (error) {
        console.error(`   ❌ Error migrating ${tableName}:`, error.message);
        // Continue with next table
      }
    }

    console.log('✅ Data migration completed!\n');

    // Show summary
    console.log('📊 Summary:');
    for (const tableName of tables) {
      try {
        const count = await cloudClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ${tableName}: ${count.rows[0].count} rows`);
      } catch (error) {
        // Table might not exist, skip
      }
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    localClient.release();
    cloudClient.release();
    await localPool.end();
    await cloudPool.end();
  }
}

// Run migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };

