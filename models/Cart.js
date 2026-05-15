import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

cartSchema.index({ userId: 1 });
cartSchema.index({ productId: 1 });
cartSchema.index({ userId: 1, productId: 1, size: 1 });

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
