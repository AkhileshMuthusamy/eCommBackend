const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    filename : {
        type : String,
        required: false
    },
    contentType : {
        type: String,
        required : false
    },
    imageBase64 : {
        type : String,
        required: false
    }
})

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6
    },
    SKU: {
        type: String,
        required: true,
        unique: true,
        min: 3
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        max: 4000,
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
    category: {
        type: String,
    },
    images: [uploadSchema],
    manufacturer: {
        type: String,
        required: false,
    }
});

module.exports = mongoose.model('Product', productSchema);