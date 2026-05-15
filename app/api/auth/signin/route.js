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
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.isDeleted) {
      return NextResponse.json({
        status: 'account_deleted',
        deletionInfo: {
          deletedAt: user.deletedAt,
          deletedBy: user.deletedBy,
          reason: 'Account deleted by administrator',
          email: user.email,
          name: user.name || 'User',
        },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.isActive === false) {
      await User.findByIdAndUpdate(user._id, { isActive: true });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const response = NextResponse.json({
      status: 'success',
      token,
      userId: user._id.toString(),
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
    return NextResponse.json({ error: error.message || 'Sign in failed' }, { status: 500 });
  }
}
