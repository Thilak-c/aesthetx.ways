import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/authMiddleware';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(null);
  }
  return NextResponse.json(user);
}
