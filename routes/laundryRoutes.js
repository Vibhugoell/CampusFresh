const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LaundryOrder = require('../models/laundrymodel');

// --- Middleware: Find user by email and attach to req ---
const findUserByEmail = async (req, res, next) => {
  try {
    // ✅ Safely extract email from any source
    const email =
      (req.body && req.body.email) ||
      (req.query && req.query.email) ||
      (req.params && req.params.email);

    if (!email) {
      return res
        .status(400)
        .json({ message: 'User email not provided. Please log in again.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    // ✅ Attach user info to req for downstream routes
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

// --- GET: Dashboard data (active + recent) ---
router.get('/dashboard', findUserByEmail, async (req, res) => {
  const user = req.user;
  const selectedHostel = req.query.hostel || user.hostel;

  try {
    // ✅ Find the most recent active order
    const activeOrder = await LaundryOrder.findOne({
      userId: user._id,
      hostel: selectedHostel,
      status: { $in: ['Submitted', 'In Process', 'Ready for Pickup'] },
    }).sort({ createdAt: -1 });

    // ✅ Fetch all completed or cancelled orders as history
    const history = await LaundryOrder.find({
      userId: user._id,
      hostel: selectedHostel,
      status: { $in: ['Delivered', 'Cancelled'] },
    }).sort({ createdAt: -1 });

    res.json({
      user: {
        firstname: user.firstname,
        email: user.email,
        hostel: selectedHostel,
      },
      activeOrder, // ✅ singular object now
      history,
    });
  } catch (err) {
    console.error('Dashboard load error:', err.message);
    res.status(500).json({ message: 'Server error loading dashboard data.' });
  }
});
// --- GET: All orders for user ---
// router.get('/my-orders/:email', findUserByEmail, async (req, res) => {
//   const { email } = req.params;
//   try {
//     const orders = await LaundryOrder.find({ userEmail: email }).sort({ submittedAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     console.error('Error fetching user orders:', err.message);
//     res.status(500).json({ message: 'Error fetching laundry orders' });
//   }
// });

module.exports = router;
