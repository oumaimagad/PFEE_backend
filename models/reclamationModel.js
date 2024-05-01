const mongoose = require('mongoose');

const ReclamationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model('Reclamation', ReclamationSchema);