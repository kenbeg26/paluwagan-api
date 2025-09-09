// Dependency
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // optional if you have a User model
    required: [true, 'User Id is Required']
  },
  scheduleOrdered: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference Product model
      required: [true, 'Product ID is required']
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
