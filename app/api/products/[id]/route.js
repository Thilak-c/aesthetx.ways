import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { protect } from '../../../../middleware/auth'

export async function GET(req, { params }) {
  try {
    await connectDB()

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { message: error.message || 'Error fetching product' },
      { status: 500 }
    )
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB()
    const user = await protect(req)

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to update products' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const product = await Product.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { message: error.message || 'Error updating product' },
      { status: 500 }
    )
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const user = await protect(req)

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to delete products' },
        { status: 403 }
      )
    }

    const product = await Product.findByIdAndDelete(params.id)

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { message: error.message || 'Error deleting product' },
      { status: 500 }
    )
  }
} 