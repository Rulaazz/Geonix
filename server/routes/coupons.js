
const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

/*
  All coupon administration requires an authenticated admin.
*/

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('role');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required.',
      });
    }

    return next();
  } catch (error) {
    console.error('COUPON ADMIN CHECK ERROR:', error);

    return res.status(500).json({
      message: 'Could not verify admin access.',
    });
  }
}

router.use(authMiddleware, requireAdmin);

/*
  GET /api/coupons/admin

  Returns the active coupon and redemption history.
*/

router.get('/admin', async (req, res) => {
  try {
    const activeCoupon = await Coupon.findOne({
      status: 'active',
    })
      .select(
        'code discountPercent productType status createdAt'
      )
      .lean();

    const history = await Coupon.find({
      status: { $in: ['redeemed', 'inactive'] },
    })
      .populate('redeemedBy', 'name email')
      .populate(
        'payment',
        'productType amountAgorot currency status createdAt verifiedAt'
      )
      .sort({ redeemedAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      activeCoupon,
      history: history.map((coupon) => ({
        code: coupon.code,
        status: coupon.status,
        discountPercent: coupon.discountPercent,
        productType: coupon.productType,
        redeemedAt: coupon.redeemedAt,
        replacedBy: coupon.replacedBy,
        student: coupon.redeemedBy
          ? {
              id: String(coupon.redeemedBy._id),
              name: coupon.redeemedBy.name,
              email: coupon.redeemedBy.email,
            }
          : null,
        payment: coupon.payment
          ? {
              id: String(coupon.payment._id),
              productType: coupon.payment.productType,
              amountAgorot: coupon.payment.amountAgorot,
              currency: coupon.payment.currency,
              status: coupon.payment.status,
              createdAt: coupon.payment.createdAt,
              verifiedAt: coupon.payment.verifiedAt,
            }
          : null,
        redemptionHistory: coupon.redemptionHistory || [],
      })),
    });
  } catch (error) {
    console.error('GET COUPON ADMIN ERROR:', error);

    return res.status(500).json({
      message: 'Could not load coupon information.',
    });
  }
});

/*
  POST /api/coupons/initialize

  Creates GEONIX10 if no coupon exists.
  If previous codes exist, uses the next numeric suffix.
  Safe to call repeatedly when a coupon is already active.

  This endpoint does not redeem coupons or mark payments paid.
*/

router.post('/initialize', async (req, res) => {
  try {
    const existing = await Coupon.findOne({
      status: 'active',
    });

    if (existing) {
      return res.json({
        message: 'An active coupon already exists.',
        coupon: existing,
      });
    }

    const existingCodes = await Coupon.find({
      code: /^GEONIX\d+$/,
    })
      .select('code')
      .lean();

    const highestNumber = existingCodes.reduce(
      (highest, coupon) => {
        const match = coupon.code.match(/^GEONIX(\d+)$/);

        if (!match) {
          return highest;
        }

        return Math.max(highest, Number(match[1]));
      },
      9
    );

    const nextNumber = highestNumber + 1;

    const coupon = await Coupon.create({
      code: `GEONIX${nextNumber}`,
      discountPercent: 10,
      productType: 'single_lesson',
      status: 'active',
    });

    return res.status(201).json({
      message: 'Active coupon created.',
      coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'A coupon already exists for this status. Reload the coupon list and try again.',
      });
    }

    console.error('INITIALIZE COUPON ERROR:', error);

    return res.status(500).json({
      message: 'Could not initialize the coupon.',
    });
  }
});

module.exports = router;
