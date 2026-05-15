import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isDeleted) {
      return NextResponse.json({
        status: 'account_deleted',
        deletionInfo: {
          deletedAt: user.deletedAt,
          reason: 'Account deleted by administrator',
          email: user.email,
          name: user.name || 'Admin',
        },
      });
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ error: 'Admin account is inactive. Contact super admin.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const response = NextResponse.json({
      status: 'success',
      token,
      userId: user._id.toString(),
      role: user.role,
      name: user.name || '',
      email: user.email,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Admin sign in failed' }, { status: 500 });
  }
}
