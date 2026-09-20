import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';
import crypto from 'crypto';
import { sendNewOrderAdminNotification } from '@/lib/email';

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
    
    // 3. Silently upsert customer profile by phone in Convex
    let resolvedUserId = 'guest';
    try {
      if (customerDetails?.phone) {
        const userUpsert = await convexClient.mutation('users:upsertUserByPhone', {
          phone: customerDetails.phone,
          fullName: customerDetails.fullName,
          email: customerDetails.email,
          address: customerDetails.address,
          houseNo: customerDetails.houseNo,
          area: customerDetails.area,
          city: customerDetails.city,
          state: customerDetails.state,
          pincode: customerDetails.pincode,
        });
        if (userUpsert?.userId) {
          resolvedUserId = userUpsert.userId;
        }
      }
    } catch (userErr) {
      console.error('Silent user upsert warning:', userErr);
    }

    // 4. Call the Convex mutation to insert the order and update product stock atomically
    const result = await convexClient.mutation('orders:createOrder', {
      userId: resolvedUserId,
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
        flatNo: customerDetails.houseNo || '',
        area: customerDetails.area || '',
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
        status: 'completed',
        paymentMethod: paymentMethod || 'CARD',
        paidAt: Date.now(),
        paidBy: customerDetails.fullName,
      },
      orderTotal: orderTotal,
      status: 'pending', // Initialize as pending matching frontend expectations
    });
    
    if (!result || !result.success) {
      return NextResponse.json({ success: false, message: result?.message || 'Failed to place order' }, { status: 400 });
    }

    // Trigger admin notification email
    try {
      await sendNewOrderAdminNotification({
        orderNumber: result.orderNumber,
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
          razorpayPaymentId,
        },
        orderTotal: orderTotal,
      });
    } catch (emailError) {
      console.error('Failed to send admin order notification email:', emailError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order placed successfully!', 
      orderNumber: result.orderNumber,
      userId: resolvedUserId,
      order: {
        orderNumber: result.orderNumber,
        items,
        customerDetails,
        paymentMethod: 'CARD',
        paymentStatus: 'paid',
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
