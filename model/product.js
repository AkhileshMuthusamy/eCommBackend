const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6
    },
    code: {
        type: String,
        required: true,
        min: 3
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    dimension: {
        type: String,
        required: false,
    },
    weight: {
        type: Number,
        required: false
    },
});

module.exports = mongoose.model('Product', productSchema);