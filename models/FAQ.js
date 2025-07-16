const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, trim: true },
  answer: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FAQ', faqSchema);
