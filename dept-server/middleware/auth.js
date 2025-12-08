require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = function deptAuth(req, res, next) {
  try {
    const token = req.header("x-dept-token");

    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.DEPT_SECRET);

    if (!decoded || decoded.role !== "department") {
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    req.department = decoded; // optional, but good practice
    next(); 
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(400).json({ msg: "Invalid token" });
  }
};
