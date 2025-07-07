const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  subCategory: {
    type: String,
    trim: true,
  },
  images: {
    type: [String],
  },
  description: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  price: {
    type: Number,
    min: 0,
  },
  offeredPrice: {
    type: Number,
    min: 0,
  },
  isInStock: {
    type: Boolean,
    default: true,
  },

  // ✅ New fields added
  boxPacking: {
    type: Boolean,
    default: false,
  },
  roundCorners: {
    type: Boolean,
    default: false,
  },
  bigSizeCard: {
    type: Boolean,
    default: false,
  },
  printingType: {
    type: String,
    trim: true,
  },
  laminationType: {
    type: String,
    trim: true,
  },
  cardSize: {
    type: String,
    trim: true,
  },
  creasing: {
    type: Boolean,
    default: false,
  },
  boardType: {
    type: String,
    trim: true,
  },
  padding: {
    type: String,
    trim: true,
  },
  specialOptions: {
    type: String,
    trim: true,
  },
  paperType: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  gsm: {
    type: Number,
    min: 0,
  },
  specialNotes: {
    type: String,
    trim: true,
  },
  boardThickness: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
