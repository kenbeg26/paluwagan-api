const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  user: { type: String, required: true }, // could be userId if you already have auth
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
