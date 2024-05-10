const mongoose = require('mongoose');
const programme = new mongoose.Schema({
    content: { type: String, required: true}
}, {
    timestamps:true,
    collection: 'programme-data'
});

const programmeModel = mongoose.model("programme-data", programme);

module.exports = programmeModel;