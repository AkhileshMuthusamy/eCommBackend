const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: [mongoose.Schema.Types.Mixed],
});

module.exports = mongoose.model('Categories', categorySchema);