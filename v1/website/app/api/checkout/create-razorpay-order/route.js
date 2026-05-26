import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount } = await request.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, message: 'Razorpay keys not configured' }, { status: 500 });
    }

    // Amount in paise
    const amountInPaise = Math.round(amount * 100);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64'),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order API Error:', data);
      return NextResponse.json({ success: false, message: data.error?.description || 'Failed to create Razorpay order' }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
