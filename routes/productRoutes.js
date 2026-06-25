const express = require('express');
const router = express.Router();
const {
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getProductsByShopSlug,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addProduct);
router.get('/my', protect, getMyProducts);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.get('/shop/:slug', getProductsByShopSlug);

module.exports = router;