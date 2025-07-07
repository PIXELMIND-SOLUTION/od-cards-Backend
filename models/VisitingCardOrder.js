const mongoose = require('mongoose');

const visitingCardOrderSchema = new mongoose.Schema({
  productCategory: {
    type: String,
  },
  productName: {
    type: String,
  },
  category: {
    type: String,
  },
  quantity: {
    type: [Number],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.every(num => typeof num === 'number');
      },
      message: 'Quantity must be an array of numbers'
    },
    default: []
  },

  boxPacking: {
    type: Boolean,
    default: false
  },
  roundCorners: {
    type: Boolean,
    default: false
  },
  bigSizeCard: {
    type: Boolean,
    default: false
  },
  cardSizeMultiplier: {
    type: Number,
    default: 1,
    min: 1,
    max: 30
  },
  // cardSize: {
  //   type: String,
  //   default: 'Standard'
  // },
  printingType: {
    type: String
  },
  laminationType: {
    type: [String]
  },
  size: {
    type: [String] // e.g., "12x18", "1/4 Demmy Size"
  },
  padding: {
    type: Boolean, // "Yes"/"No" or description
    default: false
  },
  creasing: {
    type: Boolean, // "Yes"/"No" or description
    default: false
  },
  boardType: {
    type: [String] // e.g., Dot/Check/Silver/Gold
  },
  boardThickness: {
    type: String // e.g., "3mm", "5mm"
  },
  specialOptions: {
    type: String // e.g., "Scoring", "Die Cut"
  },
  specialNotes: {
    type: String
  },
  paperType: {
    type: [String] // e.g., "Art Paper", "Maplitho"
  },
  gsm: {
    type: [String] // e.g., "300", "90-350"
  },
  images: {
    type: [],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VisitingCardOrder = mongoose.model('VisitingCardOrder', visitingCardOrderSchema);

module.exports = VisitingCardOrder;
