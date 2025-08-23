// Dependencies and Modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schedule = require("../models/Schedule");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth;

module.exports.pickSchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Check if user already has a schedule
    const existingSchedule = await Schedule.findOne({ userId: userId });
    if (existingSchedule) {
      return res.status(400).json({ message: "You already picked a product." });
    }

    // 2. Get available products
    const availableProducts = await Product.find({ isOccupied: false });
    if (availableProducts.length === 0) {
      return res.status(404).json({ message: "No available products to pick." });
    }

    // 3. Pick random product
    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    const chosenProduct = availableProducts[randomIndex];

    //4. Create schedule for the user
    const scheduleData = {
      userId: new mongoose.Types.ObjectId(userId),
      scheduleOrdered: [{
        productId: chosenProduct._id,
        name: chosenProduct.name,
        amount: chosenProduct.amount,
        number: chosenProduct.number,
      }],
      totalAmount: chosenProduct.amount,
      status: 'pending'
    };

    const newSchedule = new Schedule(scheduleData);
    await newSchedule.save();

    // 5. Update product as occupied
    chosenProduct.isOccupied = true;
    await chosenProduct.save();

    // 6. Respond success
    return res.status(201).json({
      message: "Product successfully assigned!",
      product: chosenProduct,
      schedule: newSchedule
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getAllSchedule = (req, res) => {
  // Fetch all orders
  Schedule.find()
    .then(orders => {
      res.status(200).json({ orders });
    })
    .catch(error => {
      res.status(500).json({ message: 'Error retrievving orders', error: error.message });
    });
};
