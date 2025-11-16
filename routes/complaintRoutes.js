const express = require("express");
const Complaint = require("../models/complaint");
const User = require("../models/User");
const auth = require("./auth");
const router = express.Router();

// ✅ Middleware: Fetch logged-in user from token
const findUser = async (req, res, next) => {
  const email = req.body.email || req.query.email || req.user?.email;

  if (!email) return res.status(401).json({ message: "Login required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  req.user = user;
  next();
};

// ✅ Submit complaint
router.post("/raise", findUser, async (req, res) => {
  try {
    const { message, orderId } = req.body;

    if (!message) return res.status(400).json({ message: "Complaint required" });

    const complaint = new Complaint({
      userId: req.user._id,
      userEmail: req.user.email,
      message,
      orderId: orderId || null,
      status: "Submitted",
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint submitted successfully!", complaint });

  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get complaints for logged-in user
router.get("/my", findUser, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userEmail: req.user.email,
    }).sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Error loading complaints" });
  }
});

module.exports = router;
