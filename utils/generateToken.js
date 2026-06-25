const jwt = require('jsonwebtoken');

// Creates a signed token containing the shop's ID.
// This token is what proves "I am logged in as this shop" on future requests.
const generateToken = (shopId) => {
  return jwt.sign({ id: shopId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // seller stays logged in for 30 days unless they log out
  });
};

module.exports = generateToken;