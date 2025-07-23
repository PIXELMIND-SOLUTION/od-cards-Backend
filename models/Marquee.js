// models/Marquee.js
const mongoose = require('mongoose');

const marqueeSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    icon: {
        type: String, // Optional FontAwesome class like 'fa-envelope'
        default: 'fa-envelope'
    }
}, { timestamps: true });

module.exports = mongoose.model('Marquee', marqueeSchema);
