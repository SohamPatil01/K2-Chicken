import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Check database status - verify tables and data
 */
export async function GET() {
  const client = await pool.connect();
  
  try {
    // Check products count
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    const productsCount = parseInt(productsResult.rows[0].count);
    
    // Get sample products
    const sampleProducts = await client.query('SELECT id, name, price FROM products LIMIT 5');
    
    // Check other tables
    const ordersCount = await client.query('SELECT COUNT(*) as count FROM orders');
    const usersCount = await client.query('SELECT COUNT(*) as count FROM users');
    const recipesCount = await client.query('SELECT COUNT(*) as count FROM recipes');
    
    return NextResponse.json({
      success: true,
      database: {
        products: {
          count: productsCount,
          sample: sampleProducts.rows
        },
        orders: {
          count: parseInt(ordersCount.rows[0].count)
        },
        users: {
          count: parseInt(usersCount.rows[0].count)
        },
        recipes: {
          count: parseInt(recipesCount.rows[0].count)
        }
      }
    });
  } catch (error) {
    console.error('Error checking database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  } finally {
    client.release();
  }
}

