import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

contactSchema.index({ email: 1 });
contactSchema.index({ read: 1 });
contactSchema.index({ createdAt: -1 });

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);
