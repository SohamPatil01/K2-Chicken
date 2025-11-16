import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Database migration endpoint - adds missing columns to existing tables
 * 
 * Usage: GET /api/admin/migrate-db?token=your-token
 */
export async function GET(request: NextRequest) {
  try {
    // Check token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const expectedToken = process.env.DB_INIT_TOKEN || 'change-this-token';
    
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Add ?token=your-db-init-token to the URL.' },
        { status: 401 }
      );
    }

    const client = await pool.connect();
    
    try {
      console.log('Starting database migration...');
      
      // Create product_weight_options table if it doesn't exist
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
      console.log('✅ product_weight_options table created/verified');

      // Add weight columns to order_items if they don't exist
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='order_items' AND column_name='weight_option_id') THEN
            ALTER TABLE order_items ADD COLUMN weight_option_id INTEGER REFERENCES product_weight_options(id);
            RAISE NOTICE 'Added weight_option_id column';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='order_items' AND column_name='selected_weight') THEN
            ALTER TABLE order_items ADD COLUMN selected_weight DECIMAL(10,2);
            RAISE NOTICE 'Added selected_weight column';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='order_items' AND column_name='weight_unit') THEN
            ALTER TABLE order_items ADD COLUMN weight_unit VARCHAR(10) DEFAULT 'g';
            RAISE NOTICE 'Added weight_unit column';
          END IF;
        END $$;
      `);
      console.log('✅ order_items columns added/verified');

      // Add stock columns to products if they don't exist
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='products' AND column_name='stock_quantity') THEN
            ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 100;
            RAISE NOTICE 'Added stock_quantity column';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='products' AND column_name='low_stock_threshold') THEN
            ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
            RAISE NOTICE 'Added low_stock_threshold column';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='products' AND column_name='in_stock') THEN
            ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
            RAISE NOTICE 'Added in_stock column';
          END IF;
        END $$;
      `);
      console.log('✅ products columns added/verified');

      return NextResponse.json({
        success: true,
        message: 'Database migration completed successfully! Missing columns have been added.',
        migrated: {
          product_weight_options_table: 'created/verified',
          order_items_columns: ['weight_option_id', 'selected_weight', 'weight_unit'],
          products_columns: ['stock_quantity', 'low_stock_threshold', 'in_stock']
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database migration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

