import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory (in production, use Redis or database)
    // For now, we'll use a simple in-memory store with better persistence
    if (!global.otpStore) {
      global.otpStore = new Map();
    }
    
    // Also store in a more persistent way for development
    if (!global.otpStorePersistent) {
      global.otpStorePersistent = new Map();
    }
    
    const otpData = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      createdAt: Date.now()
    };
    
    // Store OTP with expiration (5 minutes)
    global.otpStore.set(email, otpData);
    global.otpStorePersistent.set(email, otpData);
    
    console.log('OTP stored successfully:', { 
      email, 
      otp, 
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      storeSize: global.otpStore.size,
      persistentStoreSize: global.otpStorePersistent.size
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AESTHETX WAYS - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">AESTHETX WAYS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
              Thank you for signing up with AESTHETX WAYS! To complete your account setup, 
              please use the verification code below:
            </p>
            
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 8px; font-family: monospace;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
                Enter this code in the verification field
              </p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⏰ <strong>Important:</strong> This code will expire in 5 minutes for security reasons.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
              If you didn't request this verification code, please ignore this email.
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              AESTHETX WAYS - Premium Fashion & Lifestyle Store
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // For development: also return the OTP in the response
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      ...(isDevelopment && { debugOtp: otp }), // Only include in development
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 