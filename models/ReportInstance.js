import mongoose from 'mongoose';

const reportInstanceSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportTemplate', required: true },
  name: { type: String, required: true },
  parameters: {
    filters: { type: mongoose.Schema.Types.Mixed },
    dateRange: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    groupBy: String,
    sortBy: String,
    limit: Number,
  },
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
  data: mongoose.Schema.Types.Mixed,
  metadata: {
    recordCount: { type: Number, default: 0 },
    generationTime: { type: Number, default: 0 },
    dataSize: { type: Number, default: 0 },
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: String, required: true },
  expiresAt: String,
});

reportInstanceSchema.index({ templateId: 1 });
reportInstanceSchema.index({ generatedBy: 1 });
reportInstanceSchema.index({ status: 1 });
reportInstanceSchema.index({ generatedAt: -1 });

export default mongoose.models.ReportInstance || mongoose.model('ReportInstance', reportInstanceSchema);
