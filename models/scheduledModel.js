const mongoose = require("mongoose");
const Scheduled = new mongoose.Schema(
  {
    lastCheckDate: { type: Date },
    nextCheckDate: { type: Date },
    matricule: { type: String },
  },
  {
    timestamps: true,
    collection: "scheduled_data",
  }
);
const model = mongoose.model("scheduled_data", Scheduled);
module.exports = model; 