import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderType: { type: String, enum: ['user', 'admin', 'system'], required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
  isRead: { type: Boolean, default: false },
  readAt: String,
  editedAt: String,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.index({ sessionId: 1 });
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ senderType: 1 });
chatMessageSchema.index({ isRead: 1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
