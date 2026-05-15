import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import PasswordResetOTP from '@/models/PasswordResetOTP';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: true, message: 'If the email exists, an OTP has been sent.' });
    }

    if (user.isDeleted) {
      return NextResponse.json({ success: false, message: 'This account has been deleted.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await PasswordResetOTP.deleteMany({ email: normalizedEmail });
    await PasswordResetOTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      used: false,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP generated successfully',
      otp,
      email: normalizedEmail,
      userName: user.name || 'User',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
