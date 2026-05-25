import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import PasswordResetOTP from '@/models/PasswordResetOTP';
import Session from '@/models/Session';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      otp,
      used: false,
    });

    if (!otpRecord) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      await PasswordResetOTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    otpRecord.used = true;
    await otpRecord.save();

    await Session.deleteMany({ userId: user._id });

    return NextResponse.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
