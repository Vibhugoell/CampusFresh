const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

// Department Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate login details
  if (
    email !== process.env.DEPT_EMAIL ||
    password !== process.env.DEPT_PASSWORD
  ) {
    return res.status(401).json({ msg: "Invalid department login" });
  }

  // Generate secure JWT
  const token = jwt.sign(
    {
      role: "department",
      user: "LaundryDept",
      issuedAt: Date.now(),
    },
    process.env.DEPT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ token });
});

module.exports = router;
