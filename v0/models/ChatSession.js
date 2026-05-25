import mongoose from 'mongoose';

const guestInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: guestInfoSchema,
  status: { type: String, enum: ['active', 'waiting', 'closed'], default: 'active' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'low' },
  category: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessageAt: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ assignedTo: 1 });
chatSessionSchema.index({ lastMessageAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ priority: 1 });
chatSessionSchema.index({ category: 1 });

export default mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);
