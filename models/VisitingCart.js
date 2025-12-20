// models/VisitingCart.js
const mongoose = require("mongoose");

const visitingCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  userSelectedCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSelectedCard",
    required: true
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  
 instructions: [
  {
    designFile: {
      type: String // Cloudinary URL
    },
    note: {
      type: String
    }
  }
],
  
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  status: {
    type: String,
    enum: ['active', 'removed', 'ordered'],
    default: 'active'
  },
  
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
visitingCartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("VisitingCart", visitingCartSchema);