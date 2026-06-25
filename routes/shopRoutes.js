const express = require('express');
const router = express.Router();
const { getMyShop, updateMyShop, getShopBySlug } = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyShop);
router.put('/me', protect, updateMyShop);
router.get('/:slug', getShopBySlug);

module.exports = router;