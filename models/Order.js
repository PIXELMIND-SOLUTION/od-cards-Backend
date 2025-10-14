const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  items: [
    {
      visitingCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VisitingCardOrder' // ✅ updated
      },
      quantity: Number,
      designFile: String,
      deliveryPrice: Number,
      totalPrice: Number
    }
  ],
  orderTotal: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Pending'
  },
  deliveredIn: {
    type: String,
    default: '3-5 days'
  },
  orderId: { type: String, unique: true },
  deliveryDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
