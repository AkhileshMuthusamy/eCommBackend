const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 6
    },
    lastName: {
        type: String,
        required: true,
        min: 1
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('User', userSchema);