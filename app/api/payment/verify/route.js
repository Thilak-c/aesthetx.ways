import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/razorpay';
import { protect } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req) {
  try {
    await connectDB();
    await protect(req);

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = await req.json();

    // Verify payment
    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Update order status
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    order.paymentInfo = {
      razorpayOrderId,
      razorpayPaymentId,
      status: 'completed',
    };
    order.status = 'processing';

    await order.save();

    return NextResponse.json({
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 