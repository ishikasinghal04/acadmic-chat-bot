const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  paths: [
    {
      title: { type: String, required: true },
      courses: [String]
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Stream", streamSchema);
