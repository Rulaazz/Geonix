
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');

/*
  Geonix payment catalog.

  All prices are stored in agorot:
  ₪100 = 10,000 agorot.

  Coupons apply only to single lessons.
  Prices are calculated on the server.

  IMPORTANT:
  /dev/session creates pending records only.
  It does not charge a card, mark a payment as paid,
  redeem a coupon, or rotate the coupon.
*/

const CATALOG = {
  single_lesson: {
    name: 'Single Math Lesson',
    regularAmountAgorot: 10000,
    discountPercent: 10,
  },

  lesson_package: {
    name: '11-Lesson Package',
    amountAgorot: 100000,
    lessonCredits: 11,
    paidLessons: 10,
    freeLessons: 1,
    validityMonths: 3,
  },

  group_lesson: {
    name: 'Group Math Lesson',
    amountPerStudentAgorot: 7000,
    minimumStudents: 1,
    maximumStudents: 3,
  },
};

function getCatalogResponse() {
  return {
    currency: 'ILS',
    products: [
      {
        productType: 'single_lesson',
        name: CATALOG.single_lesson.name,
        regularPriceAgorot:
          CATALOG.single_lesson.regularAmountAgorot,
        discountPercent:
          CATALOG.single_lesson.discountPercent,
        priceAgorot:
          CATALOG.single_lesson.regularAmountAgorot,
        couponRequiredForDiscount: true,
      },
      {
        productType: 'lesson_package',
        name: CATALOG.lesson_package.name,
        priceAgorot:
          CATALOG.lesson_package.amountAgorot,
        lessonCredits:
          CATALOG.lesson_package.lessonCredits,
        paidLessons:
          CATALOG.lesson_package.paidLessons,
        freeLessons:
          CATALOG.lesson_package.freeLessons,
        validityMonths:
          CATALOG.lesson_package.validityMonths,
      },
      {
        productType: 'group_lesson',
        name: CATALOG.group_lesson.name,
        pricePerStudentAgorot:
          CATALOG.group_lesson.amountPerStudentAgorot,
        minimumStudents:
          CATALOG.group_lesson.minimumStudents,
        maximumStudents:
          CATALOG.group_lesson.maximumStudents,
      },
    ],
  };
}

/*
  Normalize a coupon code supplied by the client.
*/

function normalizeCouponCode(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toUpperCase();
}

/*
  Validate the current active coupon.

  This function only validates the coupon. It does not
  redeem it or change which coupon is active.
*/

async function validateSingleLessonCoupon(code) {
  const couponCode = normalizeCouponCode(code);

  if (!couponCode) {
    return {
      valid: false,
      message: 'Please enter a coupon code.',
    };
  }

  const coupon = await Coupon.findOne({
    code: couponCode,
    status: 'active',
    productType: 'single_lesson',
  });

  if (!coupon) {
    return {
      valid: false,
      message: 'This coupon is invalid or no longer active.',
    };
  }

  const regularAmountAgorot =
    CATALOG.single_lesson.regularAmountAgorot;

  const discountAgorot = Math.round(
    (regularAmountAgorot * coupon.discountPercent) / 100
  );

  const amountAgorot =
    regularAmountAgorot - discountAgorot;

  if (amountAgorot < 1) {
    return {
      valid: false,
      message: 'This coupon cannot be applied.',
    };
  }

  return {
    valid: true,
    coupon,
    couponCode: coupon.code,
    discountPercent: coupon.discountPercent,
    regularAmountAgorot,
    discountAgorot,
    amountAgorot,
  };
}

/*
  GET /api/payments/catalog

  Returns the current product prices.
*/

router.get('/catalog', authMiddleware, (req, res) => {
  return res.json(getCatalogResponse());
});

/*
  POST /api/payments/dev/session

  Development only.

  Example request:
  {
    "productType": "single_lesson",
    "couponCode": "GEONIX10"
  }

  This creates a pending record only.
  No real payment is collected.
*/

router.post(
  '/dev/session',
  authMiddleware,
  async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({
        message: 'Not found.',
      });
    }

    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(401).json({
          message: 'Authenticated user not found.',
        });
      }

      if (user.role !== 'student') {
        return res.status(403).json({
          message: 'Only students can create payment sessions.',
        });
      }

      const { productType } = req.body;
      const suppliedCouponCode = normalizeCouponCode(
        req.body.couponCode
      );

      let amountAgorot;
      let metadata = {};
      let appliedCoupon = null;

      if (productType === 'single_lesson') {
        const regularAmountAgorot =
          CATALOG.single_lesson.regularAmountAgorot;

        amountAgorot = regularAmountAgorot;

        metadata = {
          regularAmountAgorot,
          discountAgorot: 0,
          discountPercent: 0,
          couponCode: null,
          couponId: null,
        };

        if (suppliedCouponCode) {
          const result = await validateSingleLessonCoupon(
            suppliedCouponCode
          );

          if (!result.valid) {
            return res.status(400).json({
              message: result.message,
            });
          }

          appliedCoupon = result.coupon;

          amountAgorot = result.amountAgorot;

          metadata = {
            regularAmountAgorot:
              result.regularAmountAgorot,
            discountAgorot:
              result.discountAgorot,
            discountPercent:
              result.discountPercent,
            couponCode:
              result.couponCode,
            couponId:
              String(result.coupon._id),
          };
        }
      } else if (productType === 'lesson_package') {
        if (suppliedCouponCode) {
          return res.status(400).json({
            message:
              'Coupons can only be used for single lessons.',
          });
        }

        amountAgorot =
          CATALOG.lesson_package.amountAgorot;

        metadata = {
          lessonCredits:
            CATALOG.lesson_package.lessonCredits,
          paidLessons:
            CATALOG.lesson_package.paidLessons,
          freeLessons:
            CATALOG.lesson_package.freeLessons,
          validityMonths:
            CATALOG.lesson_package.validityMonths,
          discountAgorot: 0,
          couponCode: null,
          couponId: null,
        };
      } else if (productType === 'group_lesson') {
        if (suppliedCouponCode) {
          return res.status(400).json({
            message:
              'Coupons can only be used for single lessons.',
          });
        }

        const studentCount = req.body.studentCount;

        if (
          !Number.isInteger(studentCount) ||
          studentCount <
            CATALOG.group_lesson.minimumStudents ||
          studentCount >
            CATALOG.group_lesson.maximumStudents
        ) {
          return res.status(400).json({
            message:
              'Group size must be between 1 and 3 students.',
          });
        }

        amountAgorot =
          CATALOG.group_lesson.amountPerStudentAgorot *
          studentCount;

        metadata = {
          studentCount,
          amountPerStudentAgorot:
            CATALOG.group_lesson.amountPerStudentAgorot,
          discountAgorot: 0,
          couponCode: null,
          couponId: null,
        };
      } else {
        return res.status(400).json({
          message: 'Please select a valid product.',
        });
      }

      const payment = await Payment.create({
        user: user._id,
        productType,
        amountAgorot,
        currency: 'ILS',
        status: 'pending',
        provider: 'development',
        metadata,
      });

      return res.status(201).json({
        message:
          'Development payment record created. No charge was made and the coupon has not been redeemed.',
        payment: {
          id: String(payment._id),
          productType: payment.productType,
          amountAgorot: payment.amountAgorot,
          regularAmountAgorot:
            metadata.regularAmountAgorot ??
            amountAgorot,
          discountAgorot:
            metadata.discountAgorot || 0,
          discountPercent:
            metadata.discountPercent || 0,
          couponCode:
            metadata.couponCode || null,
          couponValidated: Boolean(appliedCoupon),
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          createdAt: payment.createdAt,
        },
      });
    } catch (error) {
      console.error(
        'CREATE DEVELOPMENT PAYMENT ERROR:',
        error
      );

      return res.status(500).json({
        message:
          'Could not create a development payment record.',
      });
    }
  }
);

/*
  GET /api/payments/my

  Returns only the authenticated student's own records.
*/

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.userId,
    })
      .select(
        'productType amountAgorot currency status provider createdAt verifiedAt metadata'
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      payments: payments.map((payment) => ({
        id: String(payment._id),
        productType: payment.productType,
        amountAgorot: payment.amountAgorot,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        createdAt: payment.createdAt,
        verifiedAt: payment.verifiedAt,
        couponCode:
          payment.metadata?.couponCode || null,
        discountAgorot:
          payment.metadata?.discountAgorot || 0,
      })),
    });
  } catch (error) {
    console.error('GET MY PAYMENTS ERROR:', error);

    return res.status(500).json({
      message: 'Could not load payment records.',
    });
  }
});

module.exports = router;
