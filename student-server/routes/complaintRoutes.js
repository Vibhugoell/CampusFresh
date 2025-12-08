const express = require("express");
const Complaint = require("../models/complaint");
const User = require("../models/User");
const auth = require("./auth");  // ✅ token middleware
const router = express.Router();

/* ----------------------------------------------------
   ✅ Middleware: Extract logged-in user using JWT + fetch details
---------------------------------------------------- */
const findUser = async (req, res, next) => {
  try {
   const email =
    (req.params && req.params.email) ||  // ALWAYS PRIORITY
    (req.body && req.body.email) ||
    (req.query && req.query.email);

    if (!email) return res.status(401).json({ message: "Email missing" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    req.user = {
      _id: user._id,
      email: user.email,
      firstname: user.firstname,
      hostel: user.hostel,
    };
    next();
  } catch (err) {
    console.log("findUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------
   ✅ Submit Complaint
---------------------------------------------------- */
router.post("/raise", auth, findUser, async (req, res) => { 
  try { 
    const { subject, message, orderId } = req.body; 
    if (!message) { 
      return res.status(400).json({ message: "Complaint message required" }); } 
    const complaint = new Complaint({ 
      userId: req.user._id, 
      userEmail: req.user.email, 
      subject: subject || "No Subject", 
      message, orderId: orderId || null, 
      status: "Submitted", }); 
    await complaint.save(); 
    res.status(201).json({ message: "Complaint submitted successfully!", complaint }); }
    catch (err) { console.error("Error submitting complaint:", err); 
      res.status(500).json({ message: "Server error" }); } 
    });
/* ----------------------------------------------------
   ✅ Get All Complaints of Logged-in User
---------------------------------------------------- */
router.get("/my/:email", auth,findUser, async (req, res) => {
  try {
    const email=req.params.email.toLowerCase().trim();
    console.log("📌 Fetching complaints for:", email);

    const complaints = await Complaint.find({
      userEmail: email
    }).sort({ createdAt: -1 });

    res.json({ your: complaints });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Error fetching laundry orders' });  }
});


module.exports = router;
