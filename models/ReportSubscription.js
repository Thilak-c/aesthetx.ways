import mongoose from 'mongoose';

const reportSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledReport', required: true },
  isActive: { type: Boolean, default: true },
  preferences: {
    formats: [String],
    deliveryTime: String,
    includeCharts: { type: Boolean, default: false },
  },
  subscribedAt: { type: String, required: true },
  lastDelivery: String,
});

reportSubscriptionSchema.index({ userId: 1 });
reportSubscriptionSchema.index({ scheduledReportId: 1 });
reportSubscriptionSchema.index({ isActive: 1 });

export default mongoose.models.ReportSubscription || mongoose.model('ReportSubscription', reportSubscriptionSchema);
