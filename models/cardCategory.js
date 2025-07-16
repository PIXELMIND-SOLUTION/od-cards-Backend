const mongoose = require('mongoose');

const CardCategorySchema = new mongoose.Schema({
  title: String,
  description: String,
  count: Number,
  image: String
});

module.exports = mongoose.model('CardCategory', CardCategorySchema);
