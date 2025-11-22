import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Read the logo.svg file
    const logoPath = path.join(process.cwd(), 'public', 'logo.svg')
    const logoContent = fs.readFileSync(logoPath, 'utf-8')
    
    // Return the SVG as favicon (browsers will accept SVG as favicon)
    return new NextResponse(logoContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    // If file not found, return 204 (No Content) to suppress the error
    return new NextResponse(null, { status: 204 })
  }
}

