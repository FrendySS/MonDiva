const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  size: { type: String },
  color: { type: String },
  price: { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ['processing', 'shipped', 'delivered'], required: true },
  date: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['processing', 'shipped', 'delivered'], default: 'processing' },
  statusHistory: [statusHistorySchema],
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 