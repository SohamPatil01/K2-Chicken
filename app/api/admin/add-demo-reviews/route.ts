import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
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
      // Check if reviews table exists, if not create it
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

      // Clear existing reviews (optional - comment out if you want to keep existing ones)
      // await client.query('DELETE FROM reviews');

      // Check current review count
      const countResult = await client.query('SELECT COUNT(*) FROM reviews');
      const currentCount = parseInt(countResult.rows[0].count);

      if (currentCount > 0) {
        return NextResponse.json({
          success: true,
          message: `Reviews already exist (${currentCount} reviews). To add more, delete existing reviews first.`,
          count: currentCount
        });
      }

      // Insert demo reviews
      await client.query(`
        INSERT INTO reviews (user_name, rating, comment, is_approved, is_featured, display_order) VALUES
        ('Rajesh Kumar', 5, 'Best quality chicken in town! Fresh, tender, and always delivered on time. Highly recommend K2 Chicken to everyone!', true, true, 1),
        ('Priya Sharma', 5, 'Amazing service and premium quality products. The chicken curry cut was perfect for my recipe. Will definitely order again!', true, true, 2),
        ('Amit Patel', 5, 'Excellent quality and great customer service. The whole chicken was fresh and well-packaged. Very satisfied!', true, true, 3),
        ('Sneha Desai', 4, 'Good quality chicken, delivery was quick. The prices are reasonable too. Happy with my purchase!', true, true, 4),
        ('Vikram Singh', 5, 'Top-notch quality! The chicken breast boneless was so tender. Best place to buy fresh chicken online.', true, true, 5),
        ('Anjali Mehta', 5, 'Love the variety of cuts available. The chicken wings were perfect for our party. Great service!', true, true, 6),
        ('Rahul Verma', 5, 'Outstanding freshness! The chicken drumsticks were perfect for grilling. Fast delivery and excellent packaging.', true, true, 7),
        ('Kavita Nair', 5, 'Premium quality at affordable prices. The chicken kheema made the best kebabs. Highly recommended!', true, true, 8),
        ('Mohit Agarwal', 4, 'Good quality products and timely delivery. The whole chicken was perfect for our family dinner. Will order again!', true, false, 9),
        ('Divya Reddy', 5, 'Best chicken shop in the area! Fresh, hygienic, and always on time. The chicken liver was excellent too!', true, false, 10),
        ('Arjun Menon', 5, 'Superb quality! Every cut is fresh and well-packaged. The customer service is also very responsive. 5 stars!', true, false, 11),
        ('Meera Joshi', 4, 'Great experience! The chicken was fresh and the delivery was prompt. Prices are competitive. Satisfied customer!', true, false, 12)
      `);

      const finalCount = await client.query('SELECT COUNT(*) FROM reviews');
      const totalCount = parseInt(finalCount.rows[0].count);

      return NextResponse.json({
        success: true,
        message: `Successfully added ${totalCount} demo reviews!`,
        count: totalCount,
        warning: '⚠️ Please remove or secure this endpoint after use.'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding demo reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      hint: 'Ensure your DATABASE_URL is correct and tables exist.'
    }, { status: 500 });
  }
}

