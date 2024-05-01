const mongoose = require('mongoose')
const Scheduled  = new mongoose.Schema({

somme: { type: Number },

},{
    timestamps: true,
    collection:'scheduled_data'
})
const model =mongoose.model("scheduled_data",Scheduled)
module.exports=model;