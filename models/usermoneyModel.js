const mongoose = require('mongoose');

const userMoney= new mongoose.Schema({
  matricule: { type: Number, required: true },
  money: { type: Number, default: 0 },
}, {
  timestamps: true
});

module.exports = mongoose.model('userMoney', userMoney); 