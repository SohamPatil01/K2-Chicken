import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Fix database sequences that are out of sync
 * This happens when data is migrated or inserted manually
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
      console.log('Fixing database sequences...');
      
      // Get all tables with SERIAL primary keys
      const tables = [
        'products',
        'orders',
        'order_items',
        'users',
        'user_addresses',
        'recipes',
        'promotions',
        'settings',
        'delivery_time_slots',
        'product_weight_options',
        'inventory',
        'inventory_history',
        'whatsapp_sessions',
        'whatsapp_orders',
        'whatsapp_order_items',
        'whatsapp_message_logs'
      ];

      const results: any[] = [];

      for (const tableName of tables) {
        try {
          // Check if table exists
          const tableExists = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = $1
            )
          `, [tableName]);

          if (!tableExists.rows[0].exists) {
            continue;
          }

          // Get the primary key column name
          const pkResult = await client.query(`
            SELECT column_name
            FROM information_schema.key_column_usage
            WHERE table_name = $1
            AND constraint_name LIKE '%_pkey'
            LIMIT 1
          `, [tableName]);

          if (pkResult.rows.length === 0) {
            continue;
          }

          const pkColumn = pkResult.rows[0].column_name;
          
          // Get the current max ID
          const maxIdResult = await client.query(`
            SELECT COALESCE(MAX(${pkColumn}), 0) as max_id
            FROM ${tableName}
          `);

          const maxId = parseInt(maxIdResult.rows[0].max_id) || 0;
          
          // Get the sequence name (PostgreSQL naming convention: tablename_columnname_seq)
          const sequenceName = `${tableName}_${pkColumn}_seq`;
          
          // Check if sequence exists
          const seqExists = await client.query(`
            SELECT EXISTS (
              SELECT FROM pg_sequences 
              WHERE schemaname = 'public' 
              AND sequencename = $1
            )
          `, [sequenceName]);

          if (seqExists.rows[0].exists) {
            // Set the sequence to the max ID + 1
            await client.query(`
              SELECT setval('${sequenceName}', $1, true)
            `, [maxId + 1]);
            
            results.push({
              table: tableName,
              sequence: sequenceName,
              maxId: maxId,
              newSequenceValue: maxId + 1,
              status: 'fixed'
            });
            
            console.log(`✅ Fixed sequence for ${tableName}: set to ${maxId + 1}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            table: tableName,
            status: 'error',
            error: errorMessage
          });
          console.error(`❌ Error fixing ${tableName}:`, errorMessage);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Database sequences fixed successfully!',
        results: results
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fixing sequences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

