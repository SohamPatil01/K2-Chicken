import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Restore weight options for all existing products
 * 
 * Usage: GET /api/admin/restore-weight-options?token=your-token
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
      console.log('Restoring weight options for all products...');
      
      // Get all products
      const products = await client.query('SELECT id, name, price FROM products ORDER BY name');
      
      const results: any[] = [];
      let created = 0;
      let skipped = 0;

      for (const product of products.rows) {
        try {
          // Check if weight options already exist
          const existing = await client.query(
            'SELECT COUNT(*) FROM product_weight_options WHERE product_id = $1',
            [product.id]
          );
          
          if (parseInt(existing.rows[0].count) === 0) {
            const basePrice = parseFloat(product.price);
            
            // Insert weight options: 250g, 500g (default), 1kg
            await client.query(`
              INSERT INTO product_weight_options (product_id, weight, weight_unit, price, is_default)
              VALUES 
                ($1, 250, 'g', $2, false),
                ($1, 500, 'g', $3, true),
                ($1, 1000, 'g', $4, false)
            `, [
              product.id,
              basePrice * 0.25, // 250g price
              basePrice * 0.5,  // 500g price (default)
              basePrice         // 1kg price
            ]);
            
            created += 3; // 3 weight options per product
            results.push({
              product: product.name,
              action: 'created',
              weight_options: [
                { weight: '250g', price: (basePrice * 0.25).toFixed(2) },
                { weight: '500g', price: (basePrice * 0.5).toFixed(2), is_default: true },
                { weight: '1kg', price: basePrice.toFixed(2) }
              ]
            });
            console.log(`✅ Added weight options for ${product.name}`);
          } else {
            skipped++;
            results.push({
              product: product.name,
              action: 'skipped',
              reason: 'Weight options already exist'
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            product: product.name,
            action: 'error',
            error: errorMessage
          });
          console.error(`❌ Error adding weight options for ${product.name}:`, errorMessage);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Weight options restored! Created ${created} weight option(s) for ${products.rows.length} product(s).`,
        summary: {
          total_products: products.rows.length,
          weight_options_created: created,
          products_skipped: skipped
        },
        results: results
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error restoring weight options:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

