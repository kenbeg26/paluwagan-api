// Dependency
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // owner of the schedule
    required: [true, "User Id is Required"],
  },
  scheduleOrdered: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"],
      },
      payments: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // who paid
            required: true,
          },
          status: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid",
          },
          paidAt: {
            type: Date,
          },
        },
      ],
    },
  ],
  totalAmount: {
    type: Number,
    required: [true, "Total amount is Required"],
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "settled"],
  },
  isActive: {
    type: Boolean,
    default: false
  },
});

// 🔹 Virtual field: count how many users paid per product
scheduleSchema.methods.getPaidCountForProduct = function (productId) {
  const product = this.scheduleOrdered.find(
    (p) => p.productId.toString() === productId.toString()
  );
  if (!product) return 0;

  return product.payments.filter((p) => p.status === "paid").length;
};

module.exports = mongoose.model("Schedule", scheduleSchema);
