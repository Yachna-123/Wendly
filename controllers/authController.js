const bcrypt = require('bcryptjs');
const Shop = require('../models/Shop');
const generateSlug = require('../utils/generateSlug');
const generateToken = require('../utils/generateToken');

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { phone, password, shopName, category } = req.body;

    if (!phone || !password || !shopName || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if a shop with this phone already exists
    const existingShop = await Shop.findOne({ phone });
    if (existingShop) {
      return res.status(400).json({ message: 'An account with this phone number already exists' });
    }

    // Hash the password before storing — never save plain text passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique slug from the shop name
    let slug = generateSlug(shopName);
    const slugExists = await Shop.findOne({ slug });
    if (slugExists) {
      // If "sarahs-bakery" is taken, make it "sarahs-bakery-2"
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const shop = await Shop.create({
      phone,
      password: hashedPassword,
      shopName,
      category,
      slug,
    });

    const token = generateToken(shop._id);

    res.status(201).json({
      token,
      shop: {
        id: shop._id,
        shopName: shop.shopName,
        slug: shop.slug,
        category: shop.category,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const shop = await Shop.findOne({ phone });
    if (!shop) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    // Compare submitted password against the stored hash
    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    const token = generateToken(shop._id);

    res.json({
      token,
      shop: {
        id: shop._id,
        shopName: shop.shopName,
        slug: shop.slug,
        category: shop.category,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { signup, login };