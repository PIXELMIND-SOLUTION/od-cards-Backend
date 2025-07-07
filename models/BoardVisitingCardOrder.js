const mongoose = require('mongoose');
const { Schema } = mongoose;

const boardVisitingCardSchema = new Schema({
  productCategory: {
    type: String,
    default: 'Board Visiting Cards (320 Gsm)',
  },
  productName: {
    type: String,
    default: 'Board Visiting Cards (320 Gsm)',
  },
  printingType: {
    type: String,
    required: true,
    enum: ['One Side', 'Both Side (B&B)'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 1000,
    max: 20000,
  },
  laminationType: {
    type: String,
    required: true,
  },
  roundCorners: {
    type: Boolean,
    default: false,
  },
  bigSizeCard: {
    type: Boolean,
    default: false,
  },
  cardSizeMultiplier: {
    type: Number,
    default: 1,
    min: 1,
    max: 30,
  },
  cardSize: {
    type: String,
    default: 'Standard',
  },
  images: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const BoardVisitingCardOrder = mongoose.model('BoardVisitingCardOrder', boardVisitingCardSchema);
module.exports = BoardVisitingCardOrder
