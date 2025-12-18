const mongoose = require("mongoose");

const visitingCardOrderSchema = new mongoose.Schema({
  category: { values: { type: String, default: "" } },
  subCategory: { values: { type: String, default: "" } },
  productName: { values: { type: String, default: "" } },

  // ======================================
  // PRINTING TYPE - Each option has its own price
  // ======================================
  printingType: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },  // e.g., "Single Side"
        price: { type: Number, required: true }   // e.g., 100
      }
    ]
  },

  // ======================================
  // QUANTITY (NO PRICE) - Just values
  // ======================================
  quantity: {
    isEnabled: { type: Boolean, default: true },
    values: { type: [Number], default: [] }
  },

  // ======================================
  // LAMINATION - Each option has its own price
  // ======================================
  laminationType: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },  // e.g., "Matte"
        price: { type: Number, required: true }   // e.g., 50
      }
    ]
  },

  // ======================================
  // FEATURES - Each feature's options have their own prices
  // ======================================
  features: {
    boxPacking: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },  // e.g., "Yes"
          price: { type: Number, required: true }   // e.g., 30
        }
      ]
    },
    roundCorners: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    },
    bigSizeCard: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    },
    padding: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    },
    creasing: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    },
    scoring: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    },
    shapeCutting: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    },
    dieCut: {
      isEnabled: { type: Boolean, default: true },
      options: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ]
    }
  },

  // ======================================
  // BIG SIZE MULTIPLIER
  // ======================================
  cardSizeMultiplier: {
    isEnabled: { type: Boolean, default: true },
    value: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  },

  // ======================================
  // SIZES - Each option has its own price
  // ======================================
  size: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  demmySize: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  // ======================================
  // MATERIALS - Each option has its own price
  // ======================================
  boardType: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  boardThickness: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  paperType: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  gsm: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  specialOptions: {
    isEnabled: { type: Boolean, default: true },
    options: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ]
  },

  // ======================================
  // NOTES
  // ======================================
  specialNotes: {
    isEnabled: { type: Boolean, default: true },
    value: String,
    price: { type: Number, default: 0 }
  },

  // ======================================
  // IMAGES (CLOUDINARY URLS)
  // ======================================
  images: {
    values: { type: [String], default: [] }
  },

  // ======================================
  // DESIGN FILE (CLOUDINARY URL)
  // ======================================
  designFile: {
    isEnabled: { type: Boolean, default: true },
    value: String,
    price: { type: Number, default: 0 }
  },

  // ======================================
  // TOTAL PRICING
  // ======================================
  totalPrice: Number,

  // ======================================
  // VENDOR/ADMIN INFO
  // ======================================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

});

visitingCardOrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const VisitingCardOrder = mongoose.model("VisitingCardOrder", visitingCardOrderSchema);
module.exports = VisitingCardOrder;