const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  category: { type: String, trim: true, required: true },
  subCategory: { type: String, trim: true },
  description: { type: String, trim: true },
  images: { type: [String], default: [] },

  basePrice: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  offeredPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  isInStock: { type: Boolean, default: true },

  // Card options
  printingTypes: [optionSchema],
  laminationTypes: [optionSchema],
  sizes: [optionSchema],
  boardTypes: [optionSchema],
  paperTypes: [optionSchema],
  gsmOptions: [optionSchema],

  // Add-ons
  boxPacking: { type: Number, default: 0 },
  roundCorners: { type: Number, default: 0 },
  bigSizeCard: { type: Number, default: 0 },
  creasing: { type: Number, default: 0 },
  padding: { type: Number, default: 0 },
  scoring: { type: Number, default: 0 },
  shapeCutting: { type: Number, default: 0 },

specialOptions: [
    {
      name: { type: String },
      price: { type: Number, default: 0 } // only show amount if selected
    }
  ],  specialNotes: { type: String, trim: true },

  cardSize: { type: String, trim: true },
  boardThickness: { type: String, trim: true },

  // Flags
  isBigCard: { type: Boolean, default: false },
  hasBoxPacking: { type: Boolean, default: false },
  hasRoundCorners: { type: Boolean, default: false },
  hasCreasing: { type: Boolean, default: false },
  hasPadding: { type: Boolean, default: false },
  hasScoring: { type: Boolean, default: false },
  hasShapeCutting: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
