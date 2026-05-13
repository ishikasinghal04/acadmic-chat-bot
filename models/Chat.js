const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userName: { type: String, required: true }, // StudentID
  title: { type: String, default: "New Conversation" }, // AI Generated Title
  messages: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
