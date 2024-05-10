const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    matricule: { type: Number, required: true , unique: true },
    password: { type: String, required: true },
    points:{type: Number,defaule:0},
    role: { type: String, default:'user'}
}, {
    collection: 'user-data'
});

const UserModel = mongoose.model("UserData", UserSchema);

module.exports = UserModel;
 