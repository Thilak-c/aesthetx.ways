import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect API routes (exclude Razorpay order creation route and profile route)
  if (
    pathname.startsWith('/api') &&
    pathname !== '/api/checkout/create-razorpay-order' &&
    pathname !== '/api/auth/profile'
  ) {
    // 1. Validate API Access Key
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Target all API endpoints
export const config = {
  matcher: '/api/:path*',
};
