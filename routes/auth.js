const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret'; // fallback for local dev

// ✅ REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { firstname, lastname, email, password, confirmPassword, hostel } = req.body;

  // 1️⃣ Basic validations
  if (!firstname || !lastname || !email || !password)
    return res.status(400).json({ message: 'All fields are required.' });

  if (!email.endsWith('@chitkara.edu.in'))
    return res.status(400).json({ message: 'Please use your college email.' });

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match.' });

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'User already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      hostel,
    });

    await user.save();
    res.status(201).json({ message: '🎉 Registration successful!' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    // ✅ Create JWT payload
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        hostel: user.hostel,
      },
    };

    // ✅ Sign and return token with user details
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;

      return res.status(200).json({
        message: 'Login successful!',
        token,
        email: user.email,
        firstname: user.firstname,
        hostel: user.hostel,
      });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
