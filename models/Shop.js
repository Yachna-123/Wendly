const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    shopName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: '' },

    ownerName: { type: String, trim: true, default: '' },
    ownerPhotoUrl: { type: String, default: '' },
    welcomeMessage: { type: String, trim: true, default: '' },
    shopStory: { type: String, trim: true, default: '' },
    behindScenesPhotos: { type: [String], default: [] },

    upiId: { type: String, trim: true, default: '' },

    todayEarnings: { type: Number, default: 0 },
    monthEarnings: { type: Number, default: 0 },
    lastEarningsResetDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);