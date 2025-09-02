const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1
  },
  designFile: {
    type: String, // Uploaded design file ka path (optional)
    default: null
  },
    deliveryPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
