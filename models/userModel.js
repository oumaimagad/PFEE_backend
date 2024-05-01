const mongoose = require('mongoose')

const User  = new mongoose.Schema({
    matricule: { type: Number, required: true ,unique:true },
    password:{type :String ,required:true}

},{
    collection:'user-data'
})
const model =mongoose.model("UserData",User)
module.exports=model;