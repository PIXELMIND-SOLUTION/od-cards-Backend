const mongoose = require("mongoose");

const adminChargeSchema = new mongoose.Schema({
  deliveryPrice: {
    type: Number,
    required: true,
    default: 0
  },

  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AdminCharge", adminChargeSchema);
