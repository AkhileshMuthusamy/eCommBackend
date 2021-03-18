const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    parent_id: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    child: {
        type: [mongoose.Schema.Types.String],
    },
});

module.exports = mongoose.model('Categories', categorySchema);