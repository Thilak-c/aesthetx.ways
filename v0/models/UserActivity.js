import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  activityType: { type: String, required: true },
  actionType: String,
  page: { type: String, required: true },
  previousPage: String,
  actionData: mongoose.Schema.Types.Mixed,
  deviceType: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  screenResolution: String,
  country: String,
  city: String,
  postal: String,
  ipAddress: String,
  referrer: String,
  referrerDomain: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  timestamp: { type: String, required: true },
  duration: Number,
  isAnonymized: { type: Boolean, default: false },
  optedOut: Boolean,
});

userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ sessionId: 1 });
userActivitySchema.index({ timestamp: -1 });
userActivitySchema.index({ activityType: 1 });
userActivitySchema.index({ actionType: 1 });
userActivitySchema.index({ page: 1 });
userActivitySchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.UserActivity || mongoose.model('UserActivity', userActivitySchema);
