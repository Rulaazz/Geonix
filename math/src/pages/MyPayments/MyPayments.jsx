import { API_BASE_URL as API_URL } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MyPayments.css';


const PRODUCT_NAMES = {
  single_lesson: 'Single Math Lesson',
  lesson_package: '11-Lesson Package',
  group_lesson: 'Group Math Lesson',
};

const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const formatPrice = (agorot) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 2,
  }).format((Number(agorot) || 0) / 100);

const formatDate = (date) => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '—';

  return parsedDate.toLocaleString('he-IL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${API_URL}/api/payments/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPayments(response.data.payments || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Could not load your payment records. Please log in again and retry.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <main className="my-payments-page">
      <div className="my-payments-container">
        <header className="my-payments-header">
          <div>
            <span className="my-payments-eyebrow">YOUR ACCOUNT</span>
            <h1>My Payments</h1>
            <p>View your payment records and their current status.</p>
          </div>

          <Link to="/pricing" className="my-payments-pricing-link">
            View Pricing &amp; Offers
          </Link>
        </header>

        <div className="my-payments-notice" role="note">
          These are payment records, not necessarily completed purchases.
          A record marked <strong>Pending</strong> does not mean a payment
          was successful.
        </div>

        {loading && (
          <div className="my-payments-state">Loading your payment records...</div>
        )}

        {error && (
          <div className="my-payments-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && payments.length === 0 && (
          <section className="my-payments-empty">
            <div className="my-payments-empty-icon" aria-hidden="true">
              🧾
            </div>
            <h2>No payment records yet</h2>
            <p>
              When payment records are created for your account, they will
              appear here.
            </p>
            <Link to="/pricing" className="my-payments-pricing-link">
              Explore Pricing
            </Link>
          </section>
        )}

        {!loading && !error && payments.length > 0 && (
          <>
            <div className="my-payments-summary">
              <div className="my-payments-summary-card">
                <span>Total records</span>
                <strong>{payments.length}</strong>
              </div>

              <div className="my-payments-summary-card">
                <span>Completed payments</span>
                <strong>
                  {payments.filter((payment) => payment.status === 'paid').length}
                </strong>
              </div>

              <div className="my-payments-summary-card">
                <span>Pending records</span>
                <strong>
                  {
                    payments.filter(
                      (payment) => payment.status === 'pending'
                    ).length
                  }
                </strong>
              </div>
            </div>

            <section className="my-payments-list" aria-label="Payment history">
              {payments.map((payment) => (
                <article className="my-payment-card" key={payment.id}>
                  <div className="my-payment-main">
                    <div className="my-payment-icon" aria-hidden="true">
                      {payment.productType === 'lesson_package'
                        ? '🎓'
                        : payment.productType === 'group_lesson'
                          ? '👥'
                          : '📘'}
                    </div>

                    <div className="my-payment-info">
                      <h2>
                        {PRODUCT_NAMES[payment.productType] ||
                          'Geonix lesson'}
                      </h2>
                      <p>Created: {formatDate(payment.createdAt)}</p>
                      {payment.verifiedAt && (
                        <p>Verified: {formatDate(payment.verifiedAt)}</p>
                      )}
                      {payment.couponCode && (
                        <p>
                          Coupon: <strong>{payment.couponCode}</strong>
                        </p>
                      )}
                      {payment.discountAgorot > 0 && (
                        <p>
                          Discount: {formatPrice(payment.discountAgorot)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="my-payment-side">
                    <strong className="my-payment-amount">
                      {formatPrice(payment.amountAgorot)}
                    </strong>

                    <span
                      className={`my-payment-status my-payment-status-${payment.status}`}
                    >
                      {STATUS_LABELS[payment.status] || payment.status}
                    </span>

                    <span className="my-payment-provider">
                      Provider: {payment.provider || '—'}
                    </span>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default MyPayments;