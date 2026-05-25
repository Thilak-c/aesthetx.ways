import mongoose from 'mongoose';

const reportExportSchema = new mongoose.Schema({
  reportInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportInstance', required: true },
  format: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  downloadUrl: { type: String, required: true },
  status: { type: String, enum: ['generating', 'completed', 'failed', 'expired'], default: 'generating' },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: String, required: true },
  expiresAt: { type: String, required: true },
  downloadCount: { type: Number, default: 0 },
});

reportExportSchema.index({ reportInstanceId: 1 });
reportExportSchema.index({ generatedBy: 1 });
reportExportSchema.index({ status: 1 });
reportExportSchema.index({ expiresAt: 1 });

export default mongoose.models.ReportExport || mongoose.model('ReportExport', reportExportSchema);
