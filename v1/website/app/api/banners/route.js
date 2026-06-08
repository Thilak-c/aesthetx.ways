import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    // Fetch banners from Convex using the banners:getBanners query
    const banners = await convexClient.query('banners:getBanners');
    
    // Resolve banner images to absolute URLs pointing to the admin/insys panel
    const manageUrl = process.env.NEXT_PUBLIC_INSYS_URL || 'https://manage.aesthetxways.com';
    const resolvedBanners = banners.map((banner) => {
      let imageUrl = banner.imageUrl;
      if (imageUrl) {
        // Strip out local host domain if present, or resolve relative paths
        const idx = imageUrl.indexOf('/api/uploads/');
        if (idx !== -1) {
          imageUrl = `${manageUrl}${imageUrl.substring(idx)}`;
        }
      }
      return { ...banner, imageUrl };
    });

    return NextResponse.json({ success: true, banners: resolvedBanners });
  } catch (error) {
    console.warn('Failed to fetch banners from Convex, falling back to local files:', error.message);
    return NextResponse.json({ success: true, banners: [] });
  }
}
