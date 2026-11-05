
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    productType: {
      type: String,
      enum: [
        'single_lesson',
        'lesson_package',
        'group_lesson',
      ],
      required: true,
    },

    amountAgorot: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      enum: ['ILS'],
      default: 'ILS',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'failed',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ['development', 'payplus'],
      required: true,
      default: 'development',
    },

    providerPaymentId: {
      type: String,
      default: '',
      trim: true,
    },

    checkoutUrl: {
      type: String,
      default: '',
      trim: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Payment', paymentSchema);
