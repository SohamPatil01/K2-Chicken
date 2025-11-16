import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Delete all products except the 8 main chicken products
 * 
 * Usage: GET /api/admin/cleanup-products?token=your-token
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
      console.log('Cleaning up products - keeping only main chicken products...');
      
      // List of main products to keep
      const mainProducts = [
        'Chicken Breast Boneless',
        'Chicken Curry Cut',
        'Chicken Drumstick',
        'Chicken Kheema',
        'Chicken Legs',
        'Chicken Liver',
        'Chicken Wings',
        'Whole Chicken'
      ];

      // Get all products
      const allProducts = await client.query('SELECT id, name FROM products');
      const productsToDelete = allProducts.rows.filter(
        product => !mainProducts.includes(product.name)
      );

      let deletedCount = 0;
      const deletedProducts: string[] = [];

      // Delete products that are not in the main list
      for (const product of productsToDelete) {
        try {
          // Delete associated weight options first (if table exists)
          await client.query('DELETE FROM product_weight_options WHERE product_id = $1', [product.id]);
          
          // Delete product
          await client.query('DELETE FROM products WHERE id = $1', [product.id]);
          deletedCount++;
          deletedProducts.push(product.name);
          console.log(`✅ Deleted: ${product.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Error deleting ${product.name}:`, errorMessage);
        }
      }

      // Get remaining products
      const remainingProducts = await client.query(
        'SELECT id, name FROM products ORDER BY name'
      );

      return NextResponse.json({
        success: true,
        message: `Cleanup completed! Deleted ${deletedCount} product(s).`,
        deleted: deletedProducts,
        remaining: remainingProducts.rows.map(p => p.name),
        totalRemaining: remainingProducts.rows.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error cleaning up products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

