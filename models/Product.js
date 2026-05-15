import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  buys: Number,
  inCart: Number,
  isHidden: { type: Boolean, default: false },
  category: String,
  description: String,
  mainImage: { type: String, required: true },
  otherImages: [String],
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  subcategories: String,
  type: [String],
  color: String,
  garmentType: { type: String, enum: ['upper', 'lower', 'pendant'] },
  availableSizes: [String],
  sizeStock: { type: mongoose.Schema.Types.Mixed },
  availableColors: [String],
  colorStock: { type: mongoose.Schema.Types.Mixed },
  inStock: { type: Boolean, default: true },
  totalAvailable: Number,
  currentStock: Number,
  isDeleted: { type: Boolean, default: false },
  deletedAt: String,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.index({ isDeleted: 1 });
productSchema.index({ color: 1 });
productSchema.index({ garmentType: 1 });
productSchema.index({ itemId: 1 });
productSchema.index({ category: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
