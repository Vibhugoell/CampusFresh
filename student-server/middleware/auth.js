const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // attaches user { id, email, hostel }
    next();
  } catch (err) {
    console.error('Invalid token:', err.message);
    return res.status(401).json({ message: 'Token is not valid.' });
  }
};
