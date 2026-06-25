const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, confirmOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:slug', placeOrder);
router.get('/my', protect, getMyOrders);
router.put('/:id/confirm', protect, confirmOrder);

module.exports = router;