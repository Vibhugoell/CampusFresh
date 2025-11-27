const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LaundryOrder = require('../models/laundrymodel');
const auth = require('./auth'); // adjust path if different

// --- Middleware: Find user by email and attach to req ---
const findUserByEmail = async (req, res, next) => {
  try {
    // ✅ Safely extract email from any source
    const email =
    (req.params && req.params.email) ||  // ALWAYS PRIORITY
    (req.body && req.body.email) ||
    (req.query && req.query.email);

    if (!email) {
       return res
        .status(400)
        .json({ message: 'User email not provided.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // ✅ Attach user info to req for downstream routes
    req.user=user;
    req.user = {
      _id: user._id,
      email: user.email,
      firstname: user.firstname,
      hostel: user.hostel,
    };
    
    next();
  } catch (err) {
    console.error('Error finding user:', err.message);
    res.status(500).json({ message: 'Server error during user lookup.' });
  }
};


// --- POST: Submit a new laundry order ---
router.post('/submit', findUserByEmail, async (req, res) => {
  const user = req.user;
  const { items, hostel } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Basket is empty. Please add items.' });
  }

  const finalHostel = hostel || user.hostel;
  if (!finalHostel) {
    return res.status(400).json({ message: 'Hostel is required.' });
  }

  try {
    const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const newOrder = new LaundryOrder({
      userId: user._id,
      userEmail: user.email,
      items,
      totalItems,
      hostel: finalHostel,
      status: 'Submitted',
    });

    await newOrder.save();

    res.status(200).json({
      message: `Order #${newOrder._id.toString().slice(-4)} submitted successfully!`,
      order: newOrder,
    });
  } catch (err) {
    console.error('Laundry submission error:', err.message);
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map((v) => v.message);
      return res.status(400).json({ message: `Validation Error: ${msgs.join(', ')}` });
    }
    res.status(500).json({ message: 'Server Error during order submission.' });
  }
});

// --- GET: Dashboard data (active + recent history) ---
router.get('/dashboard', findUserByEmail, async (req, res) => {
  const user = req.user;
  const selectedHostel = req.query.hostel || user.hostel;

  if (!selectedHostel) {
    return res.json({
      user: {
        firstname: user.firstname,
        email: user.email,
        hostel: null,
      },
      activeOrder: null,
      history: [],
    });
  }

  try {
    const allOrders = await LaundryOrder.find({
      $or: [
        { userId: user._id },
        { userEmail: user.email }
      ],
      hostel: selectedHostel,
    }).sort({ createdAt: -1 });

    const activeStatuses = ['Submitted', 'In Process', 'Ready for Pickup'];
    const activeOrder = allOrders.find(o => activeStatuses.includes(o.status)) || null;
    const history = allOrders.filter(o => !activeStatuses.includes(o.status));

    res.json({
      user: {
        firstname: user.firstname,
        email: user.email,
        hostel: selectedHostel,
      },
      activeOrder,
      history,
    });
  } catch (err) {
    console.error('Dashboard load error:', err.message);
    res.status(500).json({ message: 'Server error loading dashboard data.' });
  }
});


router.get('/my-orders/:email', findUserByEmail, async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();

    console.log("📌 Fetching orders for:", email);

    const orders = await LaundryOrder.find({ userEmail: email }).sort({ createdAt: -1 });

    res.json({ history: orders });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Error fetching laundry orders' });
  }
});

// GET: Protected - fetch all orders for logged-in user (no email param)
router.get('/history', findUserByEmail, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const orders = await LaundryOrder.find({ userEmail }).sort({ createdAt: -1 });
    return res.status(200).json({ history: orders });
  } catch (err) {
    console.error('Error fetching history:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});
router.post("/updateHostel", findUserByEmail, async (req, res) => {
  try {
    const { hostel } = req.body;
    const userEmail = req.user.email;

    if (!hostel) {
      return res.status(400).json({ message: "Hostel name required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { hostel },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Hostel updated successfully!",
      hostel: updatedUser.hostel,
    });
  } catch (err) {
    console.error("Error updating hostel:", err.message);
    res.status(500).json({ message: "Server error while updating hostel" });
  }
});

module.exports = router;
