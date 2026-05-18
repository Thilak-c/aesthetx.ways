import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  userAgent: String,
  referrer: String,
  viewedAt: { type: String, required: true },
  sessionId: String,
  viewType: String,
  searchQuery: String,
  category: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: String,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

viewSchema.index({ productId: 1 });
viewSchema.index({ userId: 1 });
viewSchema.index({ viewedAt: -1 });
viewSchema.index({ productId: 1, viewedAt: -1 });
viewSchema.index({ viewType: 1 });
viewSchema.index({ category: 1 });

export default mongoose.models.View || mongoose.model('View', viewSchema);
