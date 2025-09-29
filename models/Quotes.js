// models/Quote.js
const mongoose = require("mongoose");

const quotesSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, default: "Unknown" },
});

module.exports = mongoose.model("Quotes", quotesSchema);
