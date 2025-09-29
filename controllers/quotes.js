const bcrypt = require("bcrypt");
const Quotes = require("../models/Quotes");
const auth = require("../auth");
const { errorHandler } = auth;

// Get random quote
module.exports.random = async (req, res) => {
  try {
    const count = await Quotes.countDocuments();
    const random = Math.floor(Math.random() * count);
    const quote = await Quotes.findOne().skip(random);
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
