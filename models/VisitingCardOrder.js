const mongoose = require('mongoose');

const visitingCardOrderSchema = new mongoose.Schema({
  // Product Identification
  productCategory: {
    type: String,
    required: true,
    enum: [
      'Trump Visiting Cards (Synthetic)',
      'Board Visiting Cards (320 Gsm)',
      'Pocket Calenders Board (320 Gsm)',
      'Board Mixing Jobs (320 Gsm)',
      'Special Board Visiting Cards',
      'Spot Lamination Visiting Cards',
      'Gold Foil Visiting Cards',
      '100 Gsm Bond Paper',
      'Sticker Mixing Jobs',
      'Art Paper Mixing & Offset Jobs',
      'Die Cutting Visiting Cards',
      'Flute Board (Sunpack) Printing',
      'Digital Prints',
      'Wedding Cards / Invitation Cards'
    ]
  },
  
  productName: {
    type: String,
    required: true,
    enum: [
      // Trump Visiting Cards
      'Trump One Side 500 Cards',
      'Trump One Side 1000 Cards',
      'Trump (Synthetic) One Side',
      'Trump (Synthetic) Both Side',
      
      // Board Visiting Cards
      'Board Visiting Cards (320 Gsm)',
      
      // Pocket Calenders
      'Pocket Calenders',
      
      // Board Mixing Jobs
      'Board Mixing Jobs (320 Gsm)',
      
      // Special Board
      'Special Board Visiting Cards',
      
      // Spot Lamination
      'Spot Lamination Cards',
      
      // Gold Foil
      'Gold Foil Visiting Cards',
      
      // Bond Paper
      'A4 Bond Paper 100 Gsm 1000 and Above Quantity',
      'A4 Bond Paper 100 Gsm 500 and Below Quantity',
      
      // Sticker Mixing
      'Sticker Mixing (Paper Sticker)',
      
      // Offset Jobs
      'Mixing and Offset Jobs All Gsms',
      
      // Die Cutting
      'Die Cutting Visiting Cards',
      
      // Flute Board
      'Flute Board (Sunpack)',
      
      // Digital Prints
      'Digital Prints',
      'Sticker Digital Prints',
      
      // Invitation Cards
      'Wedding Cards',
      'Invitation Cards'
    ]
  },

  // ========== COMMON FIELDS ==========
  // Printing
  printingType: {
    type: String,
    enum: [
      'One Side', 
      'Both Side (B&B)', 
      'One Side / Both Side',
      'One Side / Both Side (B&B)'
    ]
  },
  
  quantity: {
    type: [Number], // Changed to array
    required: true,
    min: 1
  },
  
  // Lamination (array for multiple selections)
  laminationType: {
    type: [{
      type: String,
      enum: [
        'Without Lamination',
        'Gloss',
        'Matt',
        'Velvet',
        'UV Lamination'
      ]
    }],
    default: []
  },
  
  // Boolean Features
  features: {
    boxPacking: { type: Boolean, default: false },
    roundCorners: { type: Boolean, default: false },
    bigSizeCard: { type: Boolean, default: false },
    padding: { type: Boolean, default: false },
    creasing: { type: Boolean, default: false },
    scoring: { type: Boolean, default: false },
    shapeCutting: { type: Boolean, default: false },
    dieCut: { type: Boolean, default: false }
  },
  
 
  
  // ========== PRODUCT-SPECIFIC FIELDS ==========
  // Sizes and Demmy Sizes
  size: {
    type: String,
    enum: [
      '1/8 Size',
      '1/4 Size',
      '1/2 Size',
      '9 X 12 Inch',
      '12 X 12 Inch',
      '12 X 18 Inch',
      '13 X 19 Inch',
      '18 X 24 Inch',
      'Custom Size'
    ]
  },
  
  demmySize: {
    type: String,
    enum: ['12x18', 'Custom Size', '1/8 Size', '1/4 Size', '1/2 Size', '9 X 12 Inch', '12 X 12 Inch', '12 X 18 Inch', '13 X 19 Inch', '18 X 24 Inch']
  },
  
  customSize: {
    height: Number,
    width: Number,
    unit: { type: String, default: 'inches' }
  },
  
  // Materials
  boardType: {
    type: String,
    enum: [
      'Dot',
      'Checks',
      'Silver Metallic',
      'Gold Metallic',
      '320 Gsm Board',
      'Special Board'
    ]
  },
  
  boardThickness: {
    type: String,
    enum: ['3 mm', '5 mm']
  },
  
  paperType: {
    type: String,
    enum: [
      'Art Paper',
      'Maplitho',
      'Sticker Paper',
      'Bond Paper',
      'Art Board',
      '100 Gsm Bond Paper'
    ]
  },
  
  gsm: {
    type: String,
    enum: [
      '90 Gsm',
      '100 Gsm',
      '150 Gsm',
      '200 Gsm',
      '250 Gsm',
      '300 Gsm',
      '320 Gsm'
    ]
  },
  
  // Special Options
  specialOptions: {
    type: [{
      type: String,
      enum: [
        'Scoring',
        'Die Cut',
        'Shape Cutting',
        'Spot Lamination',
        'Gold Foil',
        'UV Lamination'
      ]
    }],
    default: []
  },
  
  // Notes and Files
  specialNotes: String,
  images: [String],
  designFile: String,
  
  // ========== PRICING ==========
  price: { 
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
  
  // ========== ORDER INFO ==========
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
visitingCardOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Validate product-specific requirements
  if (this.productCategory === 'Flute Board (Sunpack) Printing' && !this.boardThickness) {
    next(new Error('Board thickness is required for Flute Board products'));
  }
  
  if (this.features?.bigSizeCard && (!this.cardSizeMultiplier || this.cardSizeMultiplier < 2)) {
    next(new Error('Card size multiplier is required for big size cards (2-30)'));
  }
  
  next();
});

// Calculate total price before saving
visitingCardOrderSchema.pre('save', function(next) {
  if (this.price && this.deliveryPrice) {
    this.totalPrice = this.price + this.deliveryPrice;
  }
  next();
});

const VisitingCardOrder = mongoose.model('VisitingCardOrder', visitingCardOrderSchema);
module.exports = VisitingCardOrder;