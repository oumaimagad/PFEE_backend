const mongoose = require('mongoose');

const PointsSchema = new mongoose.Schema({
  matricule: { type: Number, required: true },
  points: { type: Number, default: 0 },
}, {
  timestamps: true
});

module.exports = mongoose.model('Points', PointsSchema); 