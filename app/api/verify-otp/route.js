import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PasswordResetOTP from '@/models/PasswordResetOTP';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    // Find the OTP record in MongoDB
    const storedData = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      otp,
      used: false,
    });

    if (!storedData) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date(storedData.expiresAt) < new Date()) {
      await PasswordResetOTP.findByIdAndDelete(storedData._id);
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // OTP is valid — mark as used
    storedData.used = true;
    storedData.verified = true;
    await storedData.save();

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
} 