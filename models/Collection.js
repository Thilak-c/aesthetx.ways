import mongoose from 'mongoose';

const collectionRuleSchema = new mongoose.Schema({
  filterType: { type: String, required: true },
  dateRange: Number,
  minSales: Number,
  minViews: Number,
  tags: [String],
  sortBy: String,
  sortOrder: String,
  limit: Number,
}, { _id: false });

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['automatic', 'manual'], required: true },
  rules: collectionRuleSchema,
  productIds: [String],
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  icon: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ isActive: 1 });
collectionSchema.index({ displayOrder: 1 });
collectionSchema.index({ type: 1 });

export default mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
