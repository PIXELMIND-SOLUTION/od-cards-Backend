const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    location: String,
    addresses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address'
        }]
});

module.exports = mongoose.model('User', userSchema);
