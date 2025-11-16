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

      const deletedProducts: string[] = productsToDelete.map(p => p.name);
      const productIdsToDelete = productsToDelete.map(p => p.id);

      if (productIdsToDelete.length === 0) {
        const remainingProducts = await client.query(
          'SELECT id, name FROM products ORDER BY name'
        );
        return NextResponse.json({
          success: true,
          message: 'No products to delete. All products are in the main list.',
          deleted: [],
          remaining: remainingProducts.rows.map(p => p.name),
          totalRemaining: remainingProducts.rows.length
        });
      }

      await client.query('BEGIN');
      
      try {
        // First, get all weight_option_ids for these products
        const weightOptionsResult = await client.query(
          `SELECT id FROM product_weight_options WHERE product_id = ANY($1::int[])`,
          [productIdsToDelete]
        );
        const weightOptionIds = weightOptionsResult.rows.map(r => r.id);
        
        // Handle order_items - set product_id and weight_option_id to NULL to preserve order history
        if (weightOptionIds.length > 0) {
          await client.query(
            `UPDATE order_items SET weight_option_id = NULL WHERE weight_option_id = ANY($1::int[])`,
            [weightOptionIds]
          );
        }
        await client.query(
          `UPDATE order_items SET product_id = NULL WHERE product_id = ANY($1::int[])`,
          [productIdsToDelete]
        );
        
        // Delete associated weight options after clearing references
        if (productIdsToDelete.length > 0) {
          await client.query(
            `DELETE FROM product_weight_options WHERE product_id = ANY($1::int[])`,
            [productIdsToDelete]
          );
        }
        
        // Handle whatsapp_order_items - set product_id to NULL
        await client.query(
          `UPDATE whatsapp_order_items SET product_id = NULL WHERE product_id = ANY($1::int[])`,
          [productIdsToDelete]
        );
        
        // Delete inventory records
        await client.query(
          `DELETE FROM inventory WHERE product_id = ANY($1::int[])`,
          [productIdsToDelete]
        );
        await client.query(
          `DELETE FROM inventory_history WHERE product_id = ANY($1::int[])`,
          [productIdsToDelete]
        );
        
        // Delete the products
        const deleteResult = await client.query(
          `DELETE FROM products WHERE id = ANY($1::int[]) RETURNING name`,
          [productIdsToDelete]
        );
        
        await client.query('COMMIT');
        
        const deletedCount = deleteResult.rows.length;
        console.log(`✅ Deleted ${deletedCount} product(s)`);
        
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
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
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

