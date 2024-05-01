const mongoose = require('mongoose')
const Points  = new mongoose.Schema({

pointsEpargne: { type: Number },
    

},{
    timestamps: true,
    collection:'points_data'
})
const model =mongoose.model("points_data",Points)
module.exports=model;