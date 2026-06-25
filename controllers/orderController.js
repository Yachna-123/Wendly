const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// POST /api/orders/:slug  (public — customer places an order on a shop's catalog)
const placeOrder = async (req, res) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const { customerName, customerPhone, items, fulfillmentType, deliveryAddress, requestedDate, paymentTiming } = req.body;

    if (!customerName || !customerPhone || !items || !items.length || !fulfillmentType || !requestedDate || !paymentTiming) {
      return res.status(400).json({ message: 'Missing required order details' });
    }

    // Snapshot each product's current name + price — never trust the client to send correct prices
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.shop.toString() !== shop._id.toString()) {
        return res.status(400).json({ message: `Invalid product in order: ${item.productId}` });
      }
      const quantity = item.quantity || 1;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
      totalAmount += product.price * quantity;
    }

    const order = await Order.create({
      shop: shop._id,
      customerName,
      customerPhone,
      items: orderItems,
      totalAmount,
      fulfillmentType,
      deliveryAddress: deliveryAddress || '',
      requestedDate,
      paymentTiming,
      handwrittenNote: req.body.handwrittenNote || '',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

// GET /api/orders/my  (protected — seller's dashboard order list)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ shop: req.shop._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// PUT /api/orders/:id/confirm  (protected — end-of-day delivered/paid tap-confirm)
const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ownership check — same pattern as products
    if (order.shop.toString() !== req.shop._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const { delivered, paymentReceived } = req.body;

    if (delivered === true) {
      order.status = 'delivered';
    } else if (delivered === false) {
      order.status = 'cancelled';
    }

    const wasUnpaid = !order.paymentReceived;
    if (paymentReceived === true) {
      order.paymentReceived = true;
    }

    await order.save();

    // Only add to earnings the first time a payment flips from unpaid -> paid
    if (wasUnpaid && order.paymentReceived) {
      const shop = await Shop.findById(req.shop._id);

      // Lazy daily reset — if last reset wasn't today, zero out todayEarnings first
      const today = new Date();
      const lastReset = new Date(shop.lastEarningsResetDate);
      const isNewDay =
        today.toDateString() !== lastReset.toDateString();

      if (isNewDay) {
        shop.todayEarnings = 0;
        shop.lastEarningsResetDate = today;
      }

      // Lazy monthly reset
      const isNewMonth =
        today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear();
      if (isNewMonth) {
        shop.monthEarnings = 0;
      }

      shop.todayEarnings += order.totalAmount;
      shop.monthEarnings += order.totalAmount;
      await shop.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm order', error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, confirmOrder };