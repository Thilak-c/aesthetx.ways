import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PasswordResetOTP from '@/models/PasswordResetOTP';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      otp,
      used: false,
    });

    if (!otpRecord) {
      return NextResponse.json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      await PasswordResetOTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
