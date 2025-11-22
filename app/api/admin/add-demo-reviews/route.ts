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

      // Clear existing reviews to replace with new insightful ones
      await client.query('DELETE FROM reviews');

      // Insert demo reviews - fewer but more insightful reviews about products and service
      await client.query(`
        INSERT INTO reviews (user_name, rating, comment, is_approved, is_featured, display_order) VALUES
        ('Rajesh Kumar', 5, 'Ordered the Whole Chicken for a family dinner and it was absolutely fresh! The packaging was excellent - sealed properly and arrived cold. The chicken was clean, well-cut, and had no unpleasant odor. Delivery was exactly on time as promised. The quality is restaurant-grade and the price is very reasonable. Will definitely order again!', true, true, 1),
        ('Priya Sharma', 5, 'I''ve been ordering Chicken Curry Cut regularly for my weekly meal prep. What I love most is the consistency - every order is fresh, properly portioned, and the cuts are uniform. The delivery team is always polite and calls before arriving. The weight options (250g, 500g, 1kg) make it easy to order exactly what I need. Highly recommend for regular customers!', true, true, 2),
        ('Amit Patel', 5, 'Tried the Chicken Breast Boneless for the first time and was impressed! The meat was tender, no excess fat, and perfect for grilling. The customer service team helped me choose the right weight option. Delivery was within 30 minutes and the packaging kept everything fresh. The quality is definitely better than local meat shops. Worth every rupee!', true, true, 3),
        ('Sneha Desai', 4, 'Ordered Chicken Wings for a party and they were a hit! The wings were fresh, well-cleaned, and the perfect size. Delivery was prompt and the packaging was neat. Only minor issue was I wish there were more weight options, but overall great service. The prices are competitive and the quality is good. Will order again for special occasions.', true, true, 4),
        ('Vikram Singh', 5, 'Best online chicken service in Pune! I''ve tried multiple products - Chicken Kheema, Drumsticks, and Liver. Each one is consistently fresh and well-packaged. The delivery is always on time, and they even accommodate special delivery time requests. The customer support is responsive and helpful. The variety of cuts and weight options make meal planning easy. Highly satisfied customer!', true, true, 5)
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



