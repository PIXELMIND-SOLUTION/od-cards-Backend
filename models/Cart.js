// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Store the entire visiting card order data
  visitingCardOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingCardOrder',
    required: true
  },
  
  // Or store all details directly (for backup)
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
  
  // Design file
  designFile: {
    type: String
  },
  
  // Pricing
  itemPrice: {
    type: Number,
    default: 0
  },
  deliveryPrice: {
    type: Number,
    default: 50
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('Cart', cartItemSchema);
module.exports = Cart;