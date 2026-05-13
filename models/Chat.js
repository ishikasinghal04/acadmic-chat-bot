const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      category: { type: String, default: "GENERAL" },
      isHighPriority: { type: Boolean, default: false },
      timestamp: { type: Date, default: Date.now }

    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);
