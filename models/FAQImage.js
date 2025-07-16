const mongoose = require('mongoose');

const faqImageSchema = new mongoose.Schema({
  image: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FAQImage', faqImageSchema);
