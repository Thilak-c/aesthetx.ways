import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import Order from '../../../../models/Order'
import { protect } from '../../../../middleware/auth'

export async function GET(req) {
  try {
    await connectDB()
    const user = await protect(req)

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to view orders' },
        { status: 403 }
      )
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { message: error.message || 'Error fetching orders' },
      { status: 500 }
    )
  }
} 