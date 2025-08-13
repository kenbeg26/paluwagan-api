const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth;

// Create Product (Admin only)
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
      res.status(201).json({
        name: product.name,
        amount: product.amount,
        number: product.number,
        isOccupied: product.isOccupied,
        isActive: product.isActive
      })
    })
    .catch(error => errorHandler(error, req, res));
};

// Retrieve all products (Admin only)
module.exports.getAllProducts = (req, res) => {
  Product.find({})
    .then(products => {
      console.log("Products found: ", products);
      res.status(200).json(products);
    })
    .catch(error => errorHandler(error, req, res));
};

// Retrieve all active products (public)
module.exports.getActiveProducts = (req, res) => {
  Product.find({ isActive: true })
    .then(products => res.status(200).json(products))
    .catch(error => (error, req, res));
};

// Retrieve a single product (public)
module.exports.getProductById = (req, res) => {
  Product.findById(req.params.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({ success: true, data: product });
    })
    .catch(error => errorHandler(error, req, res));
}