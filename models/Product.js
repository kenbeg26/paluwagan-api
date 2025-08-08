// Dependency

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product Name is required']
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
    required: [true, 'Occupied is required']
  },
  isActive: {
    type: Boolean,
    required: [true, 'Is Active is required']
  }
});

module.exports = mongoose.model('Product', productSchema);