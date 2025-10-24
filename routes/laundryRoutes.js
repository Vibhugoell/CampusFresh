const express = require('express');
const router = express.Router();

// Adjust path as necessary
const User = require('../models/User'); 
const LaundryOrder = require('../models/laundryModel'); // Assumed updated name/path

// Middleware to attach user object to req based on email query/body parameter
const findUserByEmail = async (req, res, next) => {
    // Get email from body (for POST) or query (for GET)
    const email = req.body.email || req.query.email;
    
    if (!email) {
        // Handles the frontend error observed: "User email not found. Please log in again."
        return res.status(400).send('User email not found. Please log in again.');
    }
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found in database.');
        }
        req.user = user; // Attach user object
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during user lookup.');
    }
};


// @route   POST /laundry/submit
// @desc    Submit a new laundry order
router.post('/submit', findUserByEmail, async (req, res) => {
    // req.user contains the user object from the middleware
    const user = req.user; 
    const { items } = req.body; 
    
    if (!items || items.length === 0) {
        return res.status(400).send('Basket is empty. Please add items.');
    }

    try {
        // Calculate total items required by the LaundryOrder schema
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        const newOrder = new LaundryOrder({
            userId: user._id, // Link to User model
            userEmail: user.email,
            items: items,
            totalItems: totalItems,
            status: 'Submitted', // Default status
            lastUpdate: Date.now()
        });

        await newOrder.save();
        // Return a confirmation message with the order ID snippet
        res.status(200).send(`Order #${newOrder._id.toString().slice(-4)} submitted successfully!`);
    } catch (err) {
        console.error("Laundry submission error:", err.message);
        if (err.name === 'ValidationError') {
            const errorMessages = Object.values(err.errors).map(val => val.message);
            return res.status(400).send(`Validation Error: ${errorMessages.join(', ')}`);
        }
        res.status(500).send('Server Error during order submission.');
    }
});


// @route   GET /api/dashboard
// @desc    Get active order and history for the logged-in user
router.get('/dashboard', findUserByEmail, async (req, res) => {
    const user = req.user; // User object attached by findUserByEmail

    try {
        // Find the single active order (Submitted, In Process, Ready for Pickup)
        const activeOrder = await LaundryOrder.findOne({
            userId: user._id,
            status: { $in: ['Submitted', 'In Process', 'Ready for Pickup'] }
        }).sort({ submittedAt: -1 });

        // Find recent history (last 5 orders, regardless of final status)
        const history = await LaundryOrder.find({
            userId: user._id,
        }).sort({ submittedAt: -1 }).limit(5);

        res.json({
            activeOrder: activeOrder,
            history: history
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error loading dashboard data.');
    }
});

module.exports = router;
