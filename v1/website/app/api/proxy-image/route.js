import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new Response('Missing URL parameter', { status: 400 });
    }

    // Server-to-server fetch avoids browser CORS limitations
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new Response(`Failed to fetch image: ${res.statusText}`, { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(blob, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Image proxy failed:', error);
    return new Response('Proxy error', { status: 500 });
  }
}
