import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source"); // optional: "google_business_profile" | "internal"

    const client = await pool.connect();
    
    try {
      // Prefer Google-synced reviews (shown first), then internal ones.
      // Return extra fields so the UI can show avatars / Google badge.
      const result = await client.query(`
        SELECT
          id,
          user_name,
          rating,
          comment,
          created_at,
          reviewed_at,
          source,
          reviewer_avatar_url,
          reviewer_profile_url,
          review_reply
        FROM reviews
        WHERE is_approved = true
          ${source ? `AND source = '${source}'` : ""}
        ORDER BY
          (source = 'google_business_profile') DESC,
          is_featured DESC,
          display_order ASC,
          COALESCE(reviewed_at, created_at) DESC
        LIMIT 9
      `);

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_name, user_phone, rating, comment } = await request.json();

    // Validate input
    if (!user_name || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input. Name and rating (1-5) are required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO reviews (user_name, user_phone, rating, comment, is_approved)
        VALUES ($1, $2, $3, $4, false)
        RETURNING id, user_name, rating, comment, created_at
      `, [user_name, user_phone || null, rating, comment || null]);

      return NextResponse.json({
        success: true,
        review: result.rows[0],
        message: 'Review submitted successfully. It will be visible after approval.'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating review:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create review', details: errorMessage },
      { status: 500 }
    );
  }
}

