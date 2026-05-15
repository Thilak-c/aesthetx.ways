import { NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { connectDB } from './db';
import User from '@/models/User';

export async function getAuthUser(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await User.findById(decoded.userId).lean();
  if (!user || user.isDeleted) return null;
  return user;
}

export async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user };
}

export async function requireAdmin(request) {
  const user = await getAuthUser(request);
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  if (user.isActive === false) {
    return { error: NextResponse.json({ error: 'Account is inactive' }, { status: 403 }) };
  }
  return { user };
}

export async function requireSuperAdmin(request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'super_admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}
