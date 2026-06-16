import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      items, 
      customerDetails, 
      paymentMethod, 
      orderTotal,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature 
    } = body;
    
    if (!items || !items.length || !customerDetails || !orderTotal) {
      return NextResponse.json({ success: false, message: 'Missing order details' }, { status: 400 });
    }

    // 1. Verify Razorpay payment signature
    if (paymentMethod !== 'COD') {
      if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
          return NextResponse.json({ success: false, message: 'Razorpay key secret not configured on server' }, { status: 500 });
        }

        const generatedSignature = crypto
          .createHmac('sha256', secret)
          .update(razorpayOrderId + '|' + razorpayPaymentId)
          .digest('hex');

        if (generatedSignature !== razorpaySignature) {
          return NextResponse.json({ success: false, message: 'Payment verification failed: invalid signature' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, message: 'Payment verification failed: missing payment identifiers' }, { status: 400 });
      }
    }
    
    // 2. Validate stock in Convex before placing order
    for (const item of items) {
      if (item.productId === 'aw-carry-bag') {
        continue;
      }
      const product = await convexClient.query('webStore:getProductByItemId', { itemId: item.productId });
      if (!product) {
        return NextResponse.json({ success: false, message: `Product ${item.name} not found` }, { status: 404 });
      }
      
      const sizeStock = product.sizeStock || {};
      const currentQty = sizeStock[item.size] || 0;
      
      if (currentQty < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Insufficient stock for ${item.name} (Size: ${item.size}). Only ${currentQty} left.` 
        }, { status: 400 });
      }
    }
    
    // 3. Call the Convex mutation to insert the order and update product stock atomically
    const result = await convexClient.mutation('orders:createOrder', {
      userId: 'guest',
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: Number(item.quantity),
        size: item.size,
      })),
      shippingDetails: {
        fullName: customerDetails.fullName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        flatNo: '',
        area: '',
        landmark: '',
        address: customerDetails.address,
        city: customerDetails.city,
        state: customerDetails.state,
        pincode: customerDetails.pincode,
        country: 'India',
      },
      paymentDetails: {
        razorpayOrderId,
        razorpayPaymentId,
        amount: orderTotal,
        currency: 'INR',
        status: paymentMethod === 'COD' ? 'pending' : 'completed',
        paymentMethod: paymentMethod || 'COD',
        paidAt: Date.now(),
        paidBy: customerDetails.fullName,
        codCharge: paymentMethod === 'COD' ? 100 : undefined,
        remainingCOD: paymentMethod === 'COD' ? (orderTotal - 100) : undefined,
      },
      orderTotal: orderTotal,
      status: 'pending', // Initialize as pending matching frontend expectations
    });
    
    if (!result || !result.success) {
      return NextResponse.json({ success: false, message: result?.message || 'Failed to place order' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order placed successfully!', 
      orderNumber: result.orderNumber,
      order: {
        orderNumber: result.orderNumber,
        items,
        customerDetails,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
        orderStatus: 'pending',
        orderTotal,
        _id: result.orderId,
      }
    });
  } catch (error) {
    console.error('Failed to create order in Convex:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
