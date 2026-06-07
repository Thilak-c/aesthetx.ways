import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    // Fetch banners from Convex using the banners:getBanners query
    const banners = await convexClient.query('banners:getBanners');
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.warn('Failed to fetch banners from Convex, falling back to local files:', error.message);
    return NextResponse.json({ success: true, banners: [] });
  }
}
