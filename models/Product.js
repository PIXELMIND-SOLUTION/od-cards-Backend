const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  images: {
    type: [String],
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    min: 0
  },
  price: {
    type: Number,
    min: 0
  },
  offeredPrice: {
    type: Number,
    min: 0
  },
  isInStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;