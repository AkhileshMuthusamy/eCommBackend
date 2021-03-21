const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address: {
        type : String,
        required: true
    },
    city: {
        type: String,
        required : true
    },
    state: {
        type: String,
        required : true
    },
    postcode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
});

const paymentSchema = new mongoose.Schema({
    type: {
        type : String,
        required: true
    },
    cardNo: {
        type: String,
    },
    name: {
        type: String,
    }
});

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        default: 'PENDING'
    },
    products: {
        type: mongoose.Schema.Types.Array,
        required: true,
    },
    shipDate: {
        type: String,
        required: false,
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    trackingNumber: {
        type: String,
        required: false,
    },
    totalAmount: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    payment: {
        type: paymentSchema,
        required: true
    },
    shippingAddress: {
        type: addressSchema
    }
});

module.exports = mongoose.model('Order', orderSchema);