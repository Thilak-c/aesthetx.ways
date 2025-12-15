import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    console.log("Payment verification request:", { razorpay_order_id, razorpay_payment_id });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing payment parameters:", { razorpay_order_id, razorpay_payment_id, razorpay_signature });
      return NextResponse.json(
        { success: false, error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Check if secret is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not configured!");
      return NextResponse.json(
        { success: false, error: 'Payment verification not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    console.log("Signature verification:", { 
      expected: signature.substring(0, 10) + "...", 
      received: razorpay_signature.substring(0, 10) + "...",
      match: signature === razorpay_signature 
    });

    if (signature !== razorpay_signature) {
      console.error("Signature mismatch!");
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log("Payment verified successfully:", razorpay_payment_id);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment: ' + error.message },
      { status: 500 }
    );
  }
} 