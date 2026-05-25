import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  buys: { type: Number, default: 0 },
  inCart: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  category: String, // 'Footwear', 'Apparel / Clothing', 'Headwear', 'Eyewear'
  description: String,
  mainImage: { type: String, required: true },
  otherImages: [String],
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  subcategories: String,
  type: [String],
  color: String,
  availableSizes: [String],
  sizeStock: { type: mongoose.Schema.Types.Mixed },
  inStock: { type: Boolean, default: true },
  totalAvailable: Number,
  currentStock: Number,
  isDeleted: { type: Boolean, default: false },
  deletedAt: String,
  deletedBy: String, // Can store user name or ID
  sizeDisplayType: { type: String, default: 'alpha' }, // 'alpha' or 'numeric'
}, { timestamps: true });

productSchema.index({ isDeleted: 1 });
productSchema.index({ itemId: 1 }, { unique: true });
productSchema.index({ category: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
