const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  visitingCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingCardOrder', // ✅ reference updated
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1
  },
  designFile: {
    type: String,
    default: null
  },
  deliveryPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
