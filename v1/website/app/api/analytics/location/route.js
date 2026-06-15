import { NextResponse } from 'next/server';
import geoip from 'geoip-lite';

export async function GET(request) {
  try {
    // 1. Inspect Vercel geo headers
    const country = request.headers.get('x-vercel-ip-country');
    const city = request.headers.get('x-vercel-ip-city');
    const postal = request.headers.get('x-vercel-ip-postal-code');
    const vercelLat = request.headers.get('x-vercel-ip-latitude');
    const vercelLon = request.headers.get('x-vercel-ip-longitude');
    
    // Resolve Client IP
    let clientIp = '127.0.0.1';
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0].trim();
    } else {
      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        clientIp = realIp;
      }
    }

    // Mask/Anonymize IP address for user privacy
    const maskIp = (ip) => {
      if (!ip) return 'unknown';
      if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
        }
      } else if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length > 2) {
          return `${parts[0]}:${parts[1]}:xxxx:xxxx`;
        }
      }
      return ip;
    };
    
    const hashedIp = maskIp(clientIp);

    // If we already have geo data from platform headers, use them
    if (country || city) {
      return NextResponse.json({
        success: true,
        country: country || 'Unknown',
        city: city || 'Unknown',
        postal: postal || 'Unknown',
        latitude: vercelLat ? parseFloat(vercelLat) : undefined,
        longitude: vercelLon ? parseFloat(vercelLon) : undefined,
        ipAddress: hashedIp,
      });
    }

    // 2. Local development fallback
    const isLocalIp = 
      clientIp === '127.0.0.1' || 
      clientIp === '::1' || 
      clientIp === 'localhost' || 
      clientIp.startsWith('192.168.') || 
      clientIp.startsWith('10.') || 
      clientIp.startsWith('172.16.') || 
      clientIp.startsWith('172.31.');

    if (isLocalIp) {
      return NextResponse.json({
        success: true,
        country: 'India',
        city: 'Patna',
        postal: '800001',
        latitude: 25.5941,
        longitude: 85.1356,
        ipAddress: hashedIp,
        isMocked: true,
      });
    }

    // 3. Fallback to offline geoip-lite lookup
    try {
      const geo = geoip.lookup(clientIp);
      if (geo) {
        let countryName = geo.country || 'Unknown';
        if (geo.country && geo.country.length === 2) {
          try {
            countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country) || geo.country;
          } catch (_) {}
        }
        return NextResponse.json({
          success: true,
          country: countryName,
          city: geo.city || 'Unknown',
          postal: geo.zip || 'Unknown',
          latitude: geo.ll ? geo.ll[0] : undefined,
          longitude: geo.ll ? geo.ll[1] : undefined,
          ipAddress: hashedIp,
        });
      }
    } catch (err) {
      console.error('Failed offline lookup via geoip-lite:', err);
    }

    // 4. Fallback to free Geo-IP API
    try {
      const geoRes = await fetch(`https://free.freeipapi.com/api/json/${clientIp}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        return NextResponse.json({
          success: true,
          country: geoData.countryName || 'Unknown',
          city: geoData.cityName || 'Unknown',
          postal: geoData.zipCode || 'Unknown',
          latitude: geoData.latitude || undefined,
          longitude: geoData.longitude || undefined,
          ipAddress: hashedIp,
        });
      }
    } catch (err) {
      console.error('Failed to fetch location from freeipapi:', err);
    }

    // Default fallback
    return NextResponse.json({
      success: true,
      country: 'Unknown',
      city: 'Unknown',
      postal: 'Unknown',
      ipAddress: hashedIp,
    });

  } catch (error) {
    console.error('Error resolving location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve location' },
      { status: 500 }
    );
  }
}
