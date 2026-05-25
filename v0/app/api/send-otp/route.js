import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import PasswordResetOTP from '@/models/PasswordResetOTP';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
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

    await connectDB();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Store OTP in MongoDB (replaces unreliable in-memory global.otpStore)
    await PasswordResetOTP.deleteMany({ email: email.toLowerCase().trim() });
    await PasswordResetOTP.create({
      email: email.toLowerCase().trim(),
      otp,
      expiresAt,
      used: false,
    });

    // Email content
    const mailOptions = {
      from: `AesthetX Ways <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification OTP',
      html: `
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8f9fa">
      <tr>
        <td align="center" style="padding: 30px 15px;">
          <!-- Main Container -->
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
            
            <!-- Header -->
          
            
            <!-- Body -->
            <tr>
              <td style="padding:40px; background:#ffffff">
                <h2 style="color:#111111; margin-bottom:25px; font-size:24px;">Verify Your Email Address</h2>
                
                <p style="color:#555555; line-height:1.7; margin-bottom:35px; font-size:15px;">
                  Thank you for signing up with <strong>AesthetX Ways</strong>! To complete your account setup, please use the verification code below:
                </p>
                
                <!-- OTP Box -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f9fa; border:2px solid #e2e8f0; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); margin-bottom:35px;">
                  <tr>
                    <td style="padding:25px; text-align:center;">
                      <div style="font-size:36px; font-weight:bold; color:#111111; letter-spacing:10px; font-family: monospace;">
                       ${otp}
                      </div>
                      <p style="color:#777777; font-size:14px; margin:12px 0 0 0;">
                        Enter this code in the verification field
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Important Note -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6; border:1px solid #d1d5db; border-radius:8px; margin-bottom:30px;">
                  <tr>
                    <td style="padding:15px; font-size:14px; color:#111111;">
                      <strong>Important:</strong> This code will expire in 5 minutes for security reasons.
                    </td>
                  </tr>
                </table>
                
                <p style="color:#777777; font-size:14px; margin:0;">
                  If you didn't request this verification code, please ignore this email.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background:#111111; color:#ffffff; text-align:center; padding:20px;">
                <p style="margin:0; font-size:12px; opacity:0.8;">
                  AesthetX Ways - Premium Fashion & Lifestyle Store
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>

      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 