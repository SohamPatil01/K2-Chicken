import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Cache for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT id, title, description, ingredients, instructions, image_url, prep_time, cook_time, servings
        FROM recipes 
        ORDER BY created_at DESC
      `)
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, ingredients, instructions, image_url, prep_time, cook_time, servings } = await request.json()
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO recipes (title, description, ingredients, instructions, image_url, prep_time, cook_time, servings)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [title, description, ingredients, instructions, image_url, prep_time, cook_time, servings])
      
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}
