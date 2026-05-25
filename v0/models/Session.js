import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionToken: { type: String, required: true },
  expiresAt: { type: String, required: true },
}, { timestamps: true });

sessionSchema.index({ sessionToken: 1 });
sessionSchema.index({ userId: 1 });

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);
