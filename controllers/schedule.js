// Dependencies and Modules
const mongoose = require("mongoose");
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

    // 4. Build scheduleOrdered array (supports multiple products in future)
    const scheduleOrdered = [
      { productId: chosenProduct._id }
    ];

    // 5. Calculate total amount
    const totalAmount = chosenProduct.amount * 10; // sum of all chosen products
    // If multiple: scheduleOrdered.reduce((sum, item) => sum + item.amount, 0);

    // 6. Create schedule
    const newSchedule = new Schedule({
      userId: new mongoose.Types.ObjectId(userId),
      scheduleOrdered,
      totalAmount,
      status: 'pending'
    });

    await newSchedule.save();

    // 7. Update product as occupied
    chosenProduct.isOccupied = true;
    await chosenProduct.save();

    // 8. Populate product details for response
    await newSchedule.populate('scheduleOrdered.productId', 'name category amount number');

    // 9. Respond success
    return res.status(201).json({
      message: "Product successfully assigned!",
      schedule: {
        _id: newSchedule._id,
        userId: newSchedule.userId,
        totalAmount: newSchedule.totalAmount,
        status: newSchedule.status,
        scheduleOrdered: newSchedule.scheduleOrdered.map(item => ({
          _id: item._id,
          status: item.status,
          product: {
            _id: item.productId._id,
            name: item.productId.name,
            category: item.productId.category,
            amount: item.productId.amount,
            number: item.productId.number
          }
        }))
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports.getAllSchedule = async (req, res) => {
  try {
    // Fetch all schedules and populate product details
    const schedules = await Schedule.find()
      .populate('scheduleOrdered.productId', 'name category amount number');

    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving schedules', error: error.message });
  }
};
