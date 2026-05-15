import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productCategory: { type: String, required: true },
  viewedAt: { type: String, required: true },
});

recentlyViewedSchema.index({ userId: 1 });
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });
recentlyViewedSchema.index({ productId: 1 });

export default mongoose.models.RecentlyViewed || mongoose.model('RecentlyViewed', recentlyViewedSchema);
