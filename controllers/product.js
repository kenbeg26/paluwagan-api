const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth;

// Create Product
module.exports.addProduct = (req, res) => {
  const { name, amount, number } = req.body;

  if (!name || !amount || !number) {
    return res.status(400).json({ error: "All fields (name, amount, number) are required" });
  }

  const newProduct = new Product({
    name,
    amount,
    number
  });

  newProduct.save()
    .then(product => {
      res.status(201)
    })
}