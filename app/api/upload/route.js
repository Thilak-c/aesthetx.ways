import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { protect, admin } from '@/middleware/auth'

export async function POST(req) {
  try {
    // Check authentication
    try {
      await protect(req)
      await admin(req)
    } catch (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Ensure the file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'File must be an image' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    // Ensure the directory exists
    const uploadDir = join(process.cwd(), 'public', 'product-images')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const path = join(uploadDir, filename)

    // Write the file to the public directory
    await writeFile(path, buffer)

    // Return the URL path that can be used in the application
    const url = `/product-images/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
} 