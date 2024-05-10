const mongoose = require('mongoose');
const offre = new mongoose.Schema({
    offreName: { type: String, required: true , unique: true },
    partenaire:{type:String}

}, {
    collection: 'offre-data'
});

const offreModel = mongoose.model("offre", offre);

module.exports = offreModel;