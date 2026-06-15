import { NextResponse } from 'next/server';

// In-memory store for rate limiting. Key: client IP, Value: array of timestamps (ms)
const rateLimitStore = new Map();

// Clean up old entries from the rateLimitStore periodically to prevent memory growth
if (typeof globalThis !== 'undefined') {
  if (!globalThis.__rateLimitCleanupInterval) {
    globalThis.__rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, timestamps] of rateLimitStore.entries()) {
        const activeTimestamps = timestamps.filter(t => t > now - 60000);
        if (activeTimestamps.length === 0) {
          rateLimitStore.delete(ip);
        } else {
          rateLimitStore.set(ip, activeTimestamps);
        }
      }
    }, 120000); // Clean up every 2 minutes
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect API routes (exclude Razorpay order creation route)
  if (pathname.startsWith('/api') && pathname !== '/api/checkout/create-razorpay-order') {
    // 1. Validate API Access Key
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }

    // 2. Enforce Rate Limiting (10 requests per minute)
    // Extract client IP address
    let clientIp = request.ip || '127.0.0.1';
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0].trim();
    } else {
      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        clientIp = realIp;
      }
    }

    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;

    let timestamps = rateLimitStore.get(clientIp) || [];
    // Filter timestamps to only keep requests from the last minute
    timestamps = timestamps.filter(time => time > now - windowMs);

    if (timestamps.length >= maxRequests) {
      return NextResponse.json(
        {
          success: false,
          error: `Too Many Requests: Rate limit exceeded. Limit is ${maxRequests} requests per minute.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((timestamps[0] + windowMs - now) / 1000).toString(),
          },
        }
      );
    }

    // Record this request timestamp
    timestamps.push(now);
    rateLimitStore.set(clientIp, timestamps);
  }

  return NextResponse.next();
}

// Target all API endpoints
export const config = {
  matcher: '/api/:path*',
};
