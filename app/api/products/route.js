import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { protect } from '@/middleware/auth';

export async function GET(req) {
  try {
    await connectDB();

    const products = await Product.find({ isVisible: true })
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching products' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await protect(req);

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to create products' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const product = await Product.create(body);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating product' },
      { status: 500 }
    );
  }
} 