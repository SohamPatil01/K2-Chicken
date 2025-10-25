import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT id, title, description, ingredients, instructions, image_url, prep_time, cook_time, servings
        FROM recipes 
        WHERE id = $1
      `, [params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, ingredients, instructions, image_url, prep_time, cook_time, servings } = await request.json()
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE recipes 
        SET title = $1, description = $2, ingredients = $3, instructions = $4, image_url = $5, prep_time = $6, cook_time = $7, servings = $8
        WHERE id = $9
        RETURNING *
      `, [title, description, ingredients, instructions, image_url, prep_time, cook_time, servings, params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        DELETE FROM recipes 
        WHERE id = $1
        RETURNING *
      `, [params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      
      return NextResponse.json({ message: 'Recipe deleted successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
  }
}
