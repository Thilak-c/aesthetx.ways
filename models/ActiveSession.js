import mongoose from 'mongoose';

const activeSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentPage: { type: String, required: true },
  lastActivity: { type: String, required: true },
  deviceType: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  country: String,
  city: String,
  postal: String,
  pageViews: { type: Number, default: 0 },
  actionsCount: { type: Number, default: 0 },
  sessionStart: { type: String, required: true },
  sessionDuration: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

activeSessionSchema.index({ sessionId: 1 });
activeSessionSchema.index({ userId: 1 });
activeSessionSchema.index({ isActive: 1 });
activeSessionSchema.index({ lastActivity: -1 });

export default mongoose.models.ActiveSession || mongoose.model('ActiveSession', activeSessionSchema);
