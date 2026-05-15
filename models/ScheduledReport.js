import mongoose from 'mongoose';

const scheduledReportSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportTemplate', required: true },
  name: { type: String, required: true },
  description: String,
  schedule: {
    frequency: { type: String, required: true },
    cronExpression: { type: String, required: true },
    timezone: { type: String, required: true },
  },
  parameters: {
    filters: mongoose.Schema.Types.Mixed,
    recipients: [String],
    formats: [String],
  },
  isActive: { type: Boolean, default: true },
  lastRun: String,
  nextRun: { type: String, required: true },
  runCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

scheduledReportSchema.index({ templateId: 1 });
scheduledReportSchema.index({ isActive: 1 });
scheduledReportSchema.index({ nextRun: 1 });
scheduledReportSchema.index({ createdBy: 1 });

export default mongoose.models.ScheduledReport || mongoose.model('ScheduledReport', scheduledReportSchema);
