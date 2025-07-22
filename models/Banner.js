const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // Array of image file names/paths
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);
