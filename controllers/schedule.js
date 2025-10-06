// Dependencies and Modules
const mongoose = require("mongoose");
const Schedule = require("../models/Schedule");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth;


/**
 * Pick a schedule for the user (random product)
 */
module.exports.pickSchedule = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Check if user already has a schedule
    const existingSchedule = await Schedule.findOne({ userId });
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

    // 4. Build scheduleOrdered array
    const scheduleOrdered = [
      {
        productId: chosenProduct._id,
        payments: [], // start with empty payments
      },
    ];

    // 5. Calculate total amount
    const totalAmount = chosenProduct.amount * 10; // adjust to your rules

    // 6. Create schedule
    const newSchedule = new Schedule({
      userId: new mongoose.Types.ObjectId(userId),
      scheduleOrdered,
      totalAmount,
      status: "pending",
    });

    await newSchedule.save();

    // 7. Update product as occupied
    chosenProduct.isOccupied = true;
    await chosenProduct.save();

    // 8. Populate product details
    await newSchedule.populate("scheduleOrdered.productId", "name category amount number");

    return res.status(201).json({
      message: "Product successfully assigned!",
      schedule: {
        _id: newSchedule._id,
        userId: newSchedule.userId,
        totalAmount: newSchedule.totalAmount,
        status: newSchedule.status,
        scheduleOrdered: newSchedule.scheduleOrdered.map((item) => ({
          _id: item._id,
          payments: item.payments, // empty at start
          product: {
            _id: item.productId._id,
            name: item.productId.name,
            category: item.productId.category,
            amount: item.productId.amount,
            number: item.productId.number,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Error in pickSchedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all schedules (for admin/overview)
 */
module.exports.getAllSchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("userId", "codename")
      .populate("scheduleOrdered.productId", "name category amount number");

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error in getAllSchedule:", error);
    res.status(500).json({ message: "Error retrieving schedules", error: error.message });
  }
};

/**
 * Get logged-in user's schedule
 */
module.exports.getSchedule = async (req, res) => {
  try {
    const userId = req.user._id;

    const mySchedule = await Schedule.find({ userId })
      .populate("scheduleOrdered.productId", "name category amount number")
      .exec();

    if (!mySchedule || mySchedule.length === 0) {
      return res.status(404).json({ message: "No schedule found for this user." });
    }

    res.status(200).json(mySchedule);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Mark specific product as paid by the logged-in user
 */
// controllers/scheduleController.js

module.exports.paidSchedule = async (req, res) => {
  try {
    const { scheduleId, productId } = req.body;
    const userId = req.user._id;

    // 1. Find schedule with product populated
    const schedule = await Schedule.findById(scheduleId)
      .populate("scheduleOrdered.productId", "name amount number")
      .exec();

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const product = schedule.scheduleOrdered.find(
      (p) => p.productId._id.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in schedule" });
    }

    // 2. Update or add payment
    let payment = product.payments.find((p) => p.userId.toString() === userId.toString());
    if (!payment) {
      product.payments.push({
        userId,
        status: "paid",
        paidAt: new Date(),
      });
    } else {
      payment.status = "paid";
      payment.paidAt = new Date();
    }

    await schedule.save();

    // 3. Count how many users paid
    const paidCount = product.payments.filter((p) => p.status === "paid").length;

    // 4. Build chat message
    const chatMessage = `${req.user.codename} has paid ₱${product.productId.amount.toLocaleString()} for ${product.productId.name} (${paidCount} user${paidCount !== 1 ? "s" : ""} paid)`;

    // 5. Save message to DB
    const newMessage = new ChatMessage({
      user: userId,
      message: chatMessage,
      timestamp: new Date(),
    });
    await newMessage.save();

    // 6. Emit to all connected clients
    if (req.io) {
      const populatedMessage = await ChatMessage.findById(newMessage._id).populate("user", "codename _id");
      req.io.emit("receiveMessage", populatedMessage);
    }

    res.json({
      message: "Payment updated successfully",
      chatMessage,
      paidCount,
    });
  } catch (error) {
    console.error("Error in paidSchedule:", error);
    res.status(500).json({ error: "Server error" });
  }
};



//update schedule

// @desc    Update a schedule
// @route   PATCH /scheduleId/update
// @access  Admin only (verify & verifyAdmin middleware)
// controllers/scheduleController.js
module.exports.updateSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  const { userId, status, isActive, paymentStatus } = req.body;

  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // ✅ Update only specific fields
    if (userId) schedule.userId = userId;
    if (status) schedule.status = status;
    if (typeof isActive !== "undefined") schedule.isActive = isActive;

    // ✅ Handle nested paymentStatus safely
    if (paymentStatus && schedule.scheduleOrdered?.[0]?.payments?.[0]) {
      schedule.scheduleOrdered[0].payments[0].status = paymentStatus;
    }

    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } catch (err) {
    res.status(500).json({ message: "Error updating schedule", error: err });
  }
};



