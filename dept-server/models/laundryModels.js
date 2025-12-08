console.log("LOADING MODEL FILE VERSION A");

const mongoose = require('mongoose');

// --- Sub-schema ---
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

// --- Main Schema ---
const LaundryOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    hostel: {
      type: String,
      required: true,
      enum: [
        'PI-A', 'IBN-A', 'NGH-A',
        'PI-B', 'IBN-B', 'NGH-B',
        'PI-C', 'IBN-C', 'VASCO',
      ],
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
    },
    totalItems: { type: Number, required: true, min: 1 },
    submittedAt: { type: Date, default: Date.now, immutable: true },
    lastUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// --- Auto update lastUpdate on save ---
LaundryOrderSchema.pre("save", function (next) {
  this.lastUpdate = new Date();
  next();
});

console.log("CHECK 81");

// --- Update lastUpdate for update operations ---
LaundryOrderSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastUpdate: new Date() });
  // next();
});

LaundryOrderSchema.pre("updateOne", function (next) {
  this.set({ lastUpdate: new Date() });
  // next();
});

// --- Instance method ---
LaundryOrderSchema.methods.isActive = function () {
  return ['Submitted', 'In Process', 'Ready for Pickup'].includes(this.status);
};

module.exports = mongoose.model('LaundryOrder', LaundryOrderSchema);
