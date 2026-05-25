import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
}, { _id: false });

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paidAt: Number,
  paidBy: String,
  paymentMethod: String,
}, { _id: false });

const deliveryStatusSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  location: String,
  timestamp: { type: Number, required: true },
  updatedBy: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  orderNumber: { type: String, required: true },
  items: [orderItemSchema],
  shippingDetails: { type: shippingSchema, required: true },
  paymentDetails: { type: paymentSchema, required: true },
  orderTotal: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  estimatedDeliveryDate: Number,
  deliveryDetails: [deliveryStatusSchema],
  shippedAt: Number,
  deliveredAt: Number,
}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ estimatedDeliveryDate: 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
