import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.toLowerCase().trim();
    const otpTrimmed = otp.trim();

    // Call Convex mutation to verify OTP and login/signup
    const result = await convexClient.mutation('auth:verifyEmailOtpAndLogin', {
      email: emailTrimmed,
      otp: otpTrimmed,
    });

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, message: result?.message || 'Invalid or expired OTP code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
