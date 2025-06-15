import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/razorpay';
import { protect } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req) {
  try {
    await connectDB();
    await protect(req);

    const { items, shippingAddress } = await req.json();

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Create Razorpay order
    const razorpayOrder = await createOrder(totalAmount);

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
    });

    return NextResponse.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 