const mongoose = require('mongoose');  // ✅ Add this line at the top

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  visitingCardOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingCardOrder',
    required: true
  },
  orderDetails: {
    productCategory: String,
    productName: String,
    printingType: String,
    quantity: Number,
    price: Number,
    images: [String]
  },
  designFile: String,
  itemPrice: Number,
  deliveryPrice: Number,
  totalPrice: Number,
  quantity: Number,
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    type: Object,
    default: {}
  },
  paymentDetails: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);