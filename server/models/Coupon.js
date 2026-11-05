
const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    discountAgorot: {
      type: Number,
      required: true,
      min: 0,
    },
    redeemedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 10,
    },
    productType: {
      type: String,
      enum: ['single_lesson'],
      default: 'single_lesson',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'redeemed', 'inactive'],
      default: 'active',
      required: true,
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    replacedBy: {
      type: String,
      default: null,
    },
    redemptionHistory: {
      type: [redemptionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

couponSchema.index(
  { status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
