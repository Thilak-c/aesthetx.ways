import mongoose from 'mongoose';

const emailNotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  orderNumber: String,
  recipientEmail: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  error: String,
  sentAt: { type: String, required: true },
  metadata: mongoose.Schema.Types.Mixed,
});

emailNotificationSchema.index({ orderNumber: 1 });
emailNotificationSchema.index({ recipientEmail: 1 });
emailNotificationSchema.index({ status: 1 });
emailNotificationSchema.index({ type: 1 });
emailNotificationSchema.index({ sentAt: -1 });

export default mongoose.models.EmailNotification || mongoose.model('EmailNotification', emailNotificationSchema);
