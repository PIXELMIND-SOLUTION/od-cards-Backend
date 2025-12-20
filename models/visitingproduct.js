const mongoose = require("mongoose");

const userSelectedCardSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VisitingCardOrder",
    required: true
  },

  // USER SELECTED OPTIONS
  selectedOptions: {
    printingType: { label: String, price: Number },
    laminationType: { label: String, price: Number },
    quantity: Number,
    size: { label: String, price: Number },
    demmySize: { label: String, price: Number },
    cardSizeMultiplier: { value: Number, price: Number },
    boardType: { label: String, price: Number },
    boardThickness: { label: String, price: Number },
    paperType: { label: String, price: Number },
    gsm: { label: String, price: Number },
    specialOptions: { label: String, price: Number },

    features: {
      boxPacking: { label: String, price: Number },
      roundCorners: { label: String, price: Number },
      bigSizeCard: { label: String, price: Number },
      padding: { label: String, price: Number },
      creasing: { label: String, price: Number },
      scoring: { label: String, price: Number },
      shapeCutting: { label: String, price: Number },
      dieCut: { label: String, price: Number }
    }
  },

  // USER UPLOADED IMAGES
  images: [],



  totalPrice: {
    type: Number,
    required: true
  },

  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("UserSelectedCard", userSelectedCardSchema);
