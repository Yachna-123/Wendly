const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');

// Runs before protected routes (e.g. dashboard, add product).
// Checks for a valid token, attaches the logged-in shop to req.shop.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach shop to the request, excluding the password field
      req.shop = await Shop.findById(decoded.id).select('-password');

      if (!req.shop) {
        return res.status(401).json({ message: 'Shop not found' });
      }

      next(); // token valid, proceed to the actual route
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };