import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  state: String,
  city: String,
  pinCode: String,
  fullAddress: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  tempPassword: String,
  tempPasswordSetAt: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: String,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletionReason: String,
  address: addressSchema,
  photoUrl: String,
  referralSource: String,
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 1 },
  interests: [String],
  selectedSizes: [String],
  phoneNumber: String,
  secondaryPhoneNumber: String,
  phoneNumberLocked: { type: Boolean, default: false },
  permanentAddress: addressSchema,
  permanentAddressLocked: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
