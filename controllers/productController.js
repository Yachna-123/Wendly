const Product = require('../models/Product');
const Shop = require('../models/Shop');

// POST /api/products  (protected — add a product to the logged-in seller's shop)
const addProduct = async (req, res) => {
  try {
    const { name, category, subCategory, description, price, imageUrl, isTodaysSpecial } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const product = await Product.create({
      shop: req.shop._id,
      name,
      category,
      subCategory: subCategory || '',
      description: description || '',
      price,
      imageUrl: imageUrl || '',
      isTodaysSpecial: isTodaysSpecial || false,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

// GET /api/products/my  (protected — all products belonging to the logged-in seller)
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.shop._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// PUT /api/products/:id  (protected — only the owning shop can edit)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ownership check — this is the critical security step
    if (product.shop.toString() !== req.shop._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const allowedFields = [
      'name', 'category', 'subCategory', 'description',
      'price', 'imageUrl', 'isTodaysSpecial', 'isAvailable',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// DELETE /api/products/:id  (protected — only the owning shop can delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.shop.toString() !== req.shop._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// GET /api/products/shop/:slug  (public — powers the customer-facing catalog)
const getProductsByShopSlug = async (req, res) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const products = await Product.find({ shop: shop._id, isAvailable: true }).sort({ category: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

module.exports = { addProduct, getMyProducts, updateProduct, deleteProduct, getProductsByShopSlug };