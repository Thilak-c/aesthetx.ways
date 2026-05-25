import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true },
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: String,
  closedAt: String,
  resolutionNotes: String,
  customerSatisfaction: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ sessionId: 1 });
supportTicketSchema.index({ userId: 1 });

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
