import mongoose from 'mongoose';

const trashSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  tableName: { type: String, required: true },
  originalData: { type: mongoose.Schema.Types.Mixed },
  deletedAt: { type: String, required: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletionReason: String,
  canRestore: { type: Boolean, default: true },
}, { timestamps: true });

trashSchema.index({ tableName: 1 });
trashSchema.index({ deletedBy: 1 });
trashSchema.index({ deletedAt: -1 });

export default mongoose.models.Trash || mongoose.model('Trash', trashSchema);
