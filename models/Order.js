const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },

    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },

    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },

    fulfillmentType: { type: String, enum: ['delivery', 'pickup'], required: true },
    deliveryAddress: { type: String, trim: true, default: '' },
    requestedDate: { type: Date, required: true },

    paymentTiming: { type: String, enum: ['pay_now', 'pay_later'], required: true },
    paymentReceived: { type: Boolean, default: false },

    status: { type: String, enum: ['placed', 'delivered', 'cancelled'], default: 'placed' },

    handwrittenNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);