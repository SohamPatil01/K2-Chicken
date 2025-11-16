import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Database initialization endpoint
 * 
 * ⚠️ SECURITY WARNING: This endpoint should be removed or protected after initial setup!
 * 
 * Usage:
 * 1. Set up your cloud database (Neon, Supabase, Railway, etc.)
 * 2. Add DATABASE_URL to Vercel environment variables
 * 3. Call this endpoint once: GET /api/admin/init-db
 * 4. DELETE this file or add authentication after initialization
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add a simple token check for security
    const token = request.headers.get('x-init-token');
    const expectedToken = process.env.DB_INIT_TOKEN || 'change-this-token';
    
    if (token !== expectedToken) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. Add x-init-token header with DB_INIT_TOKEN value.',
          hint: 'Set DB_INIT_TOKEN in your environment variables for security.'
        },
        { status: 401 }
      );
    }

    console.log('Starting database initialization...');
    
    await initializeDatabase();
    
    console.log('Database initialization completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully! All tables created and sample data inserted.',
      warning: '⚠️ Please remove or secure this endpoint after initialization.'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      hint: 'Make sure DATABASE_URL is set correctly in your environment variables.'
    }, { status: 500 });
  }
}

