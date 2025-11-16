import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Update products with correct image URLs
 * 
 * Usage: GET /api/admin/update-products-images?token=your-token
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
      console.log('Updating products with correct image URLs...');
      
      // Product image mappings - using only existing images from /public/images/
      const productUpdates = [
        {
          name: 'Chicken Breast Boneless',
          image_url: '/images/Chicken-Curry-Cut.jpg'
        },
        {
          name: 'Chicken Curry Cut',
          image_url: '/images/Chicken-Curry-Cut.jpg'
        },
        {
          name: 'Chicken Drumstick',
          image_url: '/images/Chicken-Legs.jpg'
        },
        {
          name: 'Chicken Kheema',
          image_url: '/images/Chicken-Kheema.jpg'
        },
        {
          name: 'Chicken Legs',
          image_url: '/images/Chicken-Legs.jpg'
        },
        {
          name: 'Chicken Liver',
          image_url: '/images/Chicken-Liver.jpg'
        },
        {
          name: 'Chicken Wings',
          image_url: '/images/Chicken-Wings.jpg'
        },
        {
          name: 'Whole Chicken',
          image_url: '/images/Whole-Chicken-5.jpg'
        }
      ];

      const results: any[] = [];
      let updated = 0;
      let created = 0;

      for (const product of productUpdates) {
        try {
          // Check if product exists
          const existing = await client.query(
            'SELECT id FROM products WHERE name = $1',
            [product.name]
          );

          if (existing.rows.length > 0) {
            // Update existing product
            await client.query(
              'UPDATE products SET image_url = $1 WHERE name = $2',
              [product.image_url, product.name]
            );
            updated++;
            results.push({ name: product.name, action: 'updated', image_url: product.image_url });
            console.log(`✅ Updated ${product.name}`);
          } else {
            // Create new product if it doesn't exist
            await client.query(`
              INSERT INTO products (name, description, price, image_url, category, stock_quantity, in_stock)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              product.name,
              `Fresh ${product.name.toLowerCase()} - premium quality`,
              250, // Default price, can be updated later
              product.image_url,
              'main',
              100,
              true
            ]);
            created++;
            results.push({ name: product.name, action: 'created', image_url: product.image_url });
            console.log(`✅ Created ${product.name}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ name: product.name, action: 'error', error: errorMessage });
          console.error(`❌ Error updating ${product.name}:`, errorMessage);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Products updated successfully! Updated: ${updated}, Created: ${created}`,
        results: results
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

