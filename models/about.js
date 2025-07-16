const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  image: String,
  description: String
});

module.exports = mongoose.model('About', AboutSchema);
