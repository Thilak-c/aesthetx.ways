import mongoose from 'mongoose';

const templateFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  aggregation: String,
  format: String,
}, { _id: false });

const templateFilterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  options: [String],
  required: { type: Boolean, default: false },
  defaultValue: mongoose.Schema.Types.Mixed,
}, { _id: false });

const chartConfigSchema = new mongoose.Schema({
  type: { type: String, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  groupBy: String,
}, { _id: false });

const reportTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  dataSource: { type: String, required: true },
  fields: [templateFieldSchema],
  filters: [templateFilterSchema],
  chartConfig: chartConfigSchema,
  permissions: [String],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

reportTemplateSchema.index({ category: 1 });
reportTemplateSchema.index({ createdBy: 1 });
reportTemplateSchema.index({ isActive: 1 });

export default mongoose.models.ReportTemplate || mongoose.model('ReportTemplate', reportTemplateSchema);
