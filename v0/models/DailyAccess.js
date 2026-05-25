import mongoose from 'mongoose';

const dailyAccessSchema = new mongoose.Schema({
  userIdV: { type: String, required: true },
  date: { type: String, required: true },
});

dailyAccessSchema.index({ userIdV: 1, date: 1 }, { unique: true });
dailyAccessSchema.index({ date: 1 });

export default mongoose.models.DailyAccess || mongoose.model('DailyAccess', dailyAccessSchema);
