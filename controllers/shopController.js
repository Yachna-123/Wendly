const Shop = require('../models/Shop');

// GET /api/shop/me  (protected — returns full shop data for the logged-in seller)
const getMyShop = async (req, res) => {
  try {
    // req.shop was attached by the auth middleware — already excludes password
    res.json(req.shop);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shop', error: error.message });
  }
};

// PUT /api/shop/me  (protected — seller updates their own shop details)
const updateMyShop = async (req, res) => {
  try {
    const allowedFields = [
      'shopName',
      'logoUrl',
      'ownerName',
      'ownerPhotoUrl',
      'welcomeMessage',
      'shopStory',
      'behindScenesPhotos',
      'upiId',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const shop = await Shop.findByIdAndUpdate(req.shop._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update shop', error: error.message });
  }
};

// GET /api/shop/:slug  (public — no login needed, this is the customer-facing catalog view)
const getShopBySlug = async (req, res) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug }).select(
      '-password -phone -todayEarnings -monthEarnings -lastEarningsResetDate'
    );

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shop', error: error.message });
  }
};

module.exports = { getMyShop, updateMyShop, getShopBySlug };