const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaundryOrder",
      default: null, // Complaint can be general too
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "In Review", "Resolved"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
