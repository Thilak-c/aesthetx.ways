import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ productId: 1 });
wishlistSchema.index({ userId: 1, productId: 1 });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
