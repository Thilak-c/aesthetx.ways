import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  fileUrl: String,
  createdAt: { type: Number, required: true },
});

reportSchema.index({ userId: 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
