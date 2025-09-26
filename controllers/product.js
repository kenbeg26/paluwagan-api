const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth;

// Create Product (Admin only)
module.exports.addProduct = (req, res) => {
  const { name, category, amount, number } = req.body;

  if (!name || !category || !amount || !number) {
    return res.status(400).json({ error: "All fields (name, category, amount, number) are required" });
  }

  const newProduct = new Product({
    name,
    category,
    amount,
    number
  });

  newProduct.save()
    .then(product => {
      res.status(201).json({
        name: product.name,
        category: product.category,
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

// Update Product Info (Admin only)
module.exports.updateProduct = (req, res) => {
  const productUpdates = req.body;

  Product.findByIdAndUpdate(
    req.params.productId,
    { ...productUpdates },
    { new: true }
  )
    .then(updatedProduct => {
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct
      });
    })
    .catch(error => errorHandler(error, req, res));
};

// Archive Product (Admin only)
module.exports.archiveProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      { isActive: false },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product archived successfully",
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activate Product (Admin only)
module.exports.activateProduct = (req, res) => {
  Product.findByIdAndUpdate(req.params.productId, { isActive: true }, { new: true })
    .then(product => {
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({ success: true, message: "Product activated successfully" });
    })
    .catch(error => errorHandler(error, req, res));
}