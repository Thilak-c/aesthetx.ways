import mongoose from 'mongoose';

const passwordResetOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: String, required: true },
  used: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

passwordResetOTPSchema.index({ email: 1 });
passwordResetOTPSchema.index({ otp: 1 });

export default mongoose.models.PasswordResetOTP || mongoose.model('PasswordResetOTP', passwordResetOTPSchema);
