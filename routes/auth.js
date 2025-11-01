const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Adjust path as necessary if your models folder is not one level up
const User = require('../models/User'); 

// Ensure JWT_SECRET is loaded from your environment variables in server.js
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    // Destructure required fields including hostel
    const { firstname, lastname, email, password, confirmPassword, hostel } = req.body; 

    // Simple password mismatch check
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).send('User already exists.');
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            firstname,
            lastname, 
            email,
            password: hashedPassword,
            hostel // FEATURE: Include hostel
        });

        await user.save();
        res.status(201).send('Registration successful!'); 
    } catch (err) {
        console.error(err.message);
        // Handle Mongoose validation errors 
        if (err.name === 'ValidationError') {
            const errorMessages = Object.values(err.errors).map(val => val.message);
            return res.status(400).send(errorMessages[0]);
        }
        res.status(500).send('Server error during registration.');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic input check
    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).send('Invalid Credentials.'); 

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid Credentials.'); 

        // Generate JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                hostel: user.hostel, // FEATURE: Add hostel to payload
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                
                res.status(200).json({
                    token, 
                    firstname: user.firstname,
                    email: user.email, // CRITICAL: Ensure email is returned
                    hostel: user.hostel, // FEATURE: Return hostel
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login.');
    }
});

module.exports = router;