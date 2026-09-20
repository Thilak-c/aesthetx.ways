import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').trim();

    if (!query) {
      return NextResponse.json({ success: false, message: 'Search query is required' }, { status: 400 });
    }

    const cleanDigits = query.replace(/\D/g, '').slice(-10);

    // If query is a 10-digit phone number
    if (cleanDigits.length === 10) {
      const user = await convexClient.query('users:getUserByPhone', { phone: cleanDigits });
      if (user && user._id) {
        const orders = await convexClient.query('orders:getUserOrders', { userId: user._id });
        return NextResponse.json({
          success: true,
          type: 'phone',
          user: {
            id: user._id,
            name: user.name,
            phone: cleanDigits,
            email: user.email,
          },
          orders: orders || [],
        });
      }
    }

    // Otherwise or additionally, search by order number
    const order = await convexClient.query('orders:getOrderByNumber', { orderNumber: query.toUpperCase() });
    if (order) {
      return NextResponse.json({
        success: true,
        type: 'order',
        orders: [order],
      });
    }

    return NextResponse.json({
      success: true,
      orders: [],
      message: 'No orders found matching your search.',
    });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ success: false, message: 'Failed to search orders' }, { status: 500 });
  }
}
