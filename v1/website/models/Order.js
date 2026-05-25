import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
    sizeDisplayType: String
  }],
  customerDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'pending' },
  orderTotal: { type: Number, required: true }
}, { timestamps: true });

orderSchema.index({ orderNumber: 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
