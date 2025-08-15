// Dependency

const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User Id is Required']
  },
  scheduleOrdered: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Product ID is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required']
    },
    amount: {
      type: Number,
      required: [true, 'Product amount is required']
    },
    number: {
      type: Number,
      required: [true, 'Number is required']
    },
    status: {
      type: String,
      default: 'unpaid',
      enum: ['unpaid', 'paid']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is Required']
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'settled']
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);