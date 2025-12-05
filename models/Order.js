// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
    laminationType: [String],
    boxPacking: Boolean,
    roundCorners: Boolean,
    bigSizeCard: Boolean,
    padding: Boolean,
    creasing: Boolean,
    scoring: Boolean,
    shapeCutting: Boolean,
    dieCut: Boolean,
    cardSizeMultiplier: Number,
    size: [String],
    boardType: [String],
    boardThickness: String,
    paperType: [String],
    gsm: [String],
    specialOptions: [String],
    specialNotes: String,
    images: [String]
  },
  designFile: String,
  itemPrice: {
    type: Number,
    required: true
  },
  deliveryPrice: {
    type: Number,
    required: true,
    default: 50
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, { 
  timestamps: true,
  _id: true 
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  orderItems: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  totalDeliveryCharges: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online', 'Card', 'UPI'],
    default: 'COD'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  }
}, { 
  timestamps: true 
});

// Add index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);