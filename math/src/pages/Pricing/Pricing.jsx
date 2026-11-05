import { API_BASE_URL as API_URL } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Pricing.css';

const formatPrice = (agorot) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 2,
  }).format((Number(agorot) || 0) / 100);

function Pricing() {
  const [products, setProducts] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [studentCount, setStudentCount] = useState(2);
  const [loading, setLoading] = useState(true);
  const [busyProduct, setBusyProduct] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${API_URL}/api/payments/catalog`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProducts(response.data.products || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Could not load pricing. Please log in and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const createTestRecord = async (productType) => {
    setError('');
    setNotice('');
    setBusyProduct(productType);

    try {
      const token = localStorage.getItem('token');

      const payload = { productType };

      if (productType === 'single_lesson' && couponCode.trim()) {
        payload.couponCode = couponCode.trim().toUpperCase();
      }

      if (productType === 'group_lesson') {
        payload.studentCount = Number(studentCount);
      }

      const response = await axios.post(
        `${API_URL}/api/payments/dev/session`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payment = response.data.payment;

      setNotice(
        `Test record created: ${formatPrice(payment.amountAgorot)}. ` +
        'No money was charged. This is not a completed purchase.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not create the test record. Please try again.'
      );
    } finally {
      setBusyProduct('');
    }
  };

  const renderProduct = (product) => {
    const isSingle = product.productType === 'single_lesson';
    const isPackage = product.productType === 'lesson_package';
    const isGroup = product.productType === 'group_lesson';

    let price = product.priceAgorot;

    if (isGroup) {
      price = product.pricePerStudentAgorot * Number(studentCount);
    }

    return (
      <article className="pricing-card" key={product.productType}>
        <div className="pricing-card-top">
          <span className="pricing-icon" aria-hidden="true">
            {isSingle ? '📘' : isPackage ? '🎓' : '👥'}
          </span>

          {isPackage && (
            <span className="pricing-badge">Best value</span>
          )}
        </div>

        <h2>{product.name}</h2>

        <p className="pricing-description">
          {isSingle &&
            'One individual math lesson tailored to your learning needs.'}
          {isPackage &&
            'A bundle of lessons to help you learn consistently and save time.'}
          {isGroup &&
            'A shared math lesson for a small group of students.'}
        </p>

        <div className="pricing-price">
          <strong>{formatPrice(price)}</strong>
          <span>{isGroup ? ' total' : ' one-time'}</span>
        </div>

        <ul className="pricing-features">
          {isSingle && (
            <>
              <li>One math lesson</li>
              <li>Regular price: {formatPrice(product.regularPriceAgorot)}</li>
              <li>10% discount with a valid active coupon</li>
              <li>Coupon codes apply to single lessons only</li>
            </>
          )}

          {isPackage && (
            <>
              <li>{product.lessonCredits} lesson credits</li>
              <li>
                {product.paidLessons} paid lessons + {product.freeLessons} free
              </li>
              <li>Valid for {product.validityMonths} months</li>
              <li>Coupons do not apply to packages</li>
            </>
          )}

          {isGroup && (
            <>
              <li>{formatPrice(product.pricePerStudentAgorot)} per student</li>
              <li>
                Choose between {product.minimumStudents} and{' '}
                {product.maximumStudents} students
              </li>
              <li>Coupons do not apply to group lessons</li>
            </>
          )}
        </ul>

        {isGroup && (
          <label className="pricing-group-select">
            Number of students
            <select
              value={studentCount}
              onChange={(event) => setStudentCount(Number(event.target.value))}
            >
              {Array.from(
                {
                  length:
                    product.maximumStudents -
                    product.minimumStudents +
                    1,
                },
                (_, index) => product.minimumStudents + index
              ).map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? 'student' : 'students'}
                </option>
              ))}
            </select>
          </label>
        )}

        {isSingle && (
          <label className="pricing-coupon-field">
            Coupon code (optional)
            <input
              type="text"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="Enter coupon code"
              maxLength={40}
              autoCapitalize="characters"
            />
          </label>
        )}

        <button
          type="button"
          className="pricing-test-button"
          disabled={Boolean(busyProduct)}
          onClick={() => createTestRecord(product.productType)}
        >
          {busyProduct === product.productType
            ? 'Please wait...'
            : 'Create test record — no charge'}
        </button>
      </article>
    );
  };

  return (
    <main className="pricing-page">
      <div className="pricing-container">
        <header className="pricing-hero">
          <span className="pricing-eyebrow">GEONIX LEARNING</span>
          <h1>Pricing &amp; Offers</h1>
          <p>
            Choose the learning option that works for you. Prices are displayed
            in Israeli shekels.
          </p>
        </header>

        <div className="pricing-payment-notice" role="note">
          <strong>Payments are not live yet.</strong>
          <p>
            The buttons below create development records only. They do not
            charge a card or confirm a purchase. Real PayPlus checkout must be
            connected before you can accept payments.
          </p>
        </div>

        {loading && <p className="pricing-message">Loading prices...</p>}

        {error && (
          <div className="pricing-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="pricing-success" role="status">
            {notice}{' '}
            <Link to="/my-payments">View payment records</Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <section className="pricing-grid" aria-label="Available lesson options">
            {products.map(renderProduct)}
          </section>
        )}

        {!loading && products.length === 0 && !error && (
          <p className="pricing-message">
            No pricing options are available right now.
          </p>
        )}

        <footer className="pricing-footer">
          <p>Already created a payment record?</p>
          <Link to="/my-payments">View My Payments →</Link>
        </footer>
      </div>
    </main>
  );
}

export default Pricing;