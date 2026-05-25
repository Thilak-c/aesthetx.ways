import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  size: String,
  recommend: { type: Boolean, default: true },
  verified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: String,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
