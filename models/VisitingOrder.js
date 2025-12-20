const mongoose = require("mongoose");

const visitingOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VisitingCart",
    required: true
  },

  adminChargeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminCharge",
    required: true
  },

  subTotal: {
    type: Number,
    required: true
  },

  deliveryPrice: {
    type: Number,
    required: true
  },

  taxPrice: {
    type: Number,
    required: true
  },

  totalPrice: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "completed", "cancelled"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("VisitingOrder", visitingOrderSchema);
