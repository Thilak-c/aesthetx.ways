import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    // Fetch banners from Convex using the banners:getBanners query
    const banners = await convexClient.query('banners:getBanners');
    
    // Resolve banner images to absolute URLs pointing to the admin/insys panel
    const requestUrl = new URL(request.url);
    const hostname = requestUrl.hostname;

    const envUrl = process.env.NEXT_PUBLIC_INSYS_URL;
    let manageUrl = 'https://manage.aesthetxways.com';

    if (envUrl) {
      if (envUrl.startsWith('https://')) {
        manageUrl = envUrl;
      } else {
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isLocalIp = hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.');

        if (isLocalhost) {
          manageUrl = envUrl;
        } else if (isLocalIp) {
          manageUrl = envUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
        }
      }
    }

    const resolvedBanners = banners.map((banner) => {
      let imageUrl = banner.imageUrl;
      if (imageUrl) {
        // Strip out local host domain if present, or resolve relative paths
        const isLocalhostDbUrl = imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1');
        const isRelativePath = imageUrl.startsWith('/');

        if (isLocalhostDbUrl || isRelativePath) {
          const idx = imageUrl.indexOf('/api/uploads/');
          if (idx !== -1) {
            imageUrl = `${manageUrl}${imageUrl.substring(idx)}`;
          }
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
