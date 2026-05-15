import mongoose from 'mongoose';

const dailyAccessSchema = new mongoose.Schema({
  userIdV: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.models.DailyAccess || mongoose.model('DailyAccess', dailyAccessSchema);
