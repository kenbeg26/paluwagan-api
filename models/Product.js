// Dependency

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product Name is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  number: {
    type: Number,
    required: [true, 'Number is required']
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Product', productSchema);