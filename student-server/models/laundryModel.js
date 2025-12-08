const mongoose = require('mongoose');

// --- Sub-schema for individual laundry items ---
const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false }
);

// --- Main Laundry Order schema ---
const LaundryOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
    },
    hostel: {
      type: String,
      required: [true, 'Hostel is required'],
      enum: [
        'PI-A', 'IBN-A', 'NGH-A',
        'PI-B', 'IBN-B', 'NGH-B',
        'PI-C', 'IBN-C', 'VASCO',
      ],
      trim: true,
    },
    items: {
      type: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one laundry item required',
      },
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'In Process',
        'Ready for Pickup',
        'Delivered',
        'Cancelled',
      ],
      default: 'Submitted',
      required: true,
    },
    totalItems: { type: Number, required: true, min: 1 },
    submittedAt: {type: Date, default: Date.now,immutable: true},
    lastUpdate: { type: Date, default: Date.now },
  },
  {timestamps: true}
);

// --- Middleware to auto-update `lastUpdate` on any change ---
LaundryOrderSchema.pre("save", function (next) {
  this.lastUpdate = new Date();
  next();
});
// --- Auto-update lastUpdate on any update operation ---
LaundryOrderSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ lastUpdate: new Date() });
  next();
});

// --- Instance method: Check if order is still active ---
LaundryOrderSchema.methods.isActive = function () {
  return ['Submitted', 'In Process', 'Ready for Pickup'].includes(this.status);
};

// --- Export model ---
module.exports = mongoose.model('LaundryOrder', LaundryOrderSchema);
