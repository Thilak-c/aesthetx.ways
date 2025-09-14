import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    console.log('Verify OTP request:', { email, otp });
    console.log('Global OTP store exists:', !!global.otpStore);
    if (global.otpStore) {
      console.log('OTP store size:', global.otpStore.size);
      console.log('Available emails:', Array.from(global.otpStore.keys()));
    }

    if (!email || !otp) {
      console.log('Missing email or OTP');
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get stored OTP data
    if (!global.otpStore && !global.otpStorePersistent) {
      console.log('No OTP store found');
      return NextResponse.json(
        { success: false, message: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Try to get OTP from both stores
    let storedData = global.otpStore?.get(email) || global.otpStorePersistent?.get(email);
    console.log('Stored data for email:', storedData);

    if (!storedData) {
      console.log('No stored data found for email:', email);
      return NextResponse.json(
        { success: false, message: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const now = Date.now();
    const isExpired = now > storedData.expiresAt;
    console.log('OTP expiration check:', { now, expiresAt: storedData.expiresAt, isExpired });
    
    if (isExpired) {
      global.otpStore?.delete(email);
      global.otpStorePersistent?.delete(email);
      console.log('OTP expired, removed from both stores');
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isOtpValid = storedData.otp === otp;
    console.log('OTP validation:', { stored: storedData.otp, received: otp, isValid: isOtpValid });
    
    if (!isOtpValid) {
      console.log('Invalid OTP');
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from both stores
    global.otpStore?.delete(email);
    global.otpStorePersistent?.delete(email);
    console.log('OTP verified successfully, removed from both stores');

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