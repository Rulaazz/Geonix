import { API_BASE_URL as API_URL } from '../../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import { useUser } from '../../components/UserContext/UserContext';

import './InstructorSetup.css';


function InstructorSetup() {
  const navigate = useNavigate();

  const { user, login } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================
  // BECOME INSTRUCTOR
  // =========================

  const handleBecomeInstructor = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please log in first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/api/instructor-setup/become-instructor`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      if (updatedUser) {
        login(updatedUser);
      }

      setSuccess(
        'Your instructor account has been created successfully!'
      );

      setTimeout(() => {
        navigate('/instructor-dashboard');
      }, 1200);
    } catch (err) {
      console.error('BECOME INSTRUCTOR ERROR:', err);

      setError(
        err.response?.data?.message ||
          'Could not create your instructor account.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // NO USER
  // =========================

  if (!user) {
    return (
      <div className="instructor-setup-page">
        <main className="setup-main">
          <div className="setup-message-card">
            <div className="setup-message-icon">
              🔐
            </div>

            <span className="setup-label">
              GEONIX
            </span>

            <h1>
              Login Required
            </h1>

            <p>
              Please log in before setting up your
              instructor account.
            </p>

            <Link
              to="/login"
              className="setup-primary-button"
            >
              Go to Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // ALREADY INSTRUCTOR
  // =========================

  if (user.role === 'instructor') {
    return (
      <div className="instructor-setup-page">
        <main className="setup-main">
          <div className="setup-success-card">

            <div className="large-success-icon">
              ✓
            </div>

            <span className="setup-label">
              INSTRUCTOR ACCOUNT
            </span>

            <h1>
              You're already an instructor
            </h1>

            <p>
              Your instructor account is ready.
              You can now manage your availability
              and prepare your schedule for students.
            </p>

            <Link
              to="/instructor-dashboard"
              className="setup-primary-button"
            >
              Open Instructor Dashboard
            </Link>

          </div>
        </main>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="instructor-setup-page">

      <main className="setup-main">

        {/* =========================
            HERO
        ========================= */}

        <section className="setup-hero">

          <div className="setup-hero-icon">
            👩‍🏫
          </div>

          <span className="setup-label">
            GEONIX INSTRUCTOR
          </span>

          <h1>
            Start Teaching Math
          </h1>

          <p>
            Turn your Geonix account into an
            instructor account and start building
            your online teaching schedule.
          </p>

        </section>


        {/* =========================
            BENEFITS
        ========================= */}

        <section className="setup-benefits">

          <div className="benefit-card">

            <div className="benefit-icon">
              📅
            </div>

            <h3>
              Create Your Schedule
            </h3>

            <p>
              Choose the days and times when
              students can book lessons with you.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon">
              👨‍🎓
            </div>

            <h3>
              Teach Students
            </h3>

            <p>
              Students will be able to discover
              instructors and request lessons.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon">
              🎥
            </div>

            <h3>
              Live Online Lessons
            </h3>

            <p>
              Later, confirmed bookings will
              connect to a live video classroom.
            </p>

          </div>

        </section>


        {/* =========================
            SETUP CARD
        ========================= */}

        <section className="setup-card">

          <div className="setup-card-header">

            <div>
              <span className="setup-label">
                STEP 1
              </span>

              <h2>
                Create Instructor Account
              </h2>
            </div>

            <div className="step-number">
              01
            </div>

          </div>


          {/* =========================
              ACCOUNT PREVIEW
          ========================= */}

          <div className="account-preview">

            <div className="preview-avatar">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : 'G'}
            </div>

            <div className="preview-info">

              <strong>
                {user.name || 'Geonix Student'}
              </strong>

              <span>
                {user.email}
              </span>

              <small>
                Current role: {user.role || 'student'}
              </small>

            </div>

          </div>


          {/* =========================
              NOTICE
          ========================= */}

          <div className="setup-notice">

            <span>
              ℹ️
            </span>

            <p>
              This setup will change your account
              role to instructor and create your
              instructor profile.
            </p>

          </div>


          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div
              className="setup-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* =========================
              SUCCESS
          ========================= */}

          {success && (
            <div
              className="setup-success"
              role="status"
            >
              {success}
            </div>
          )}


          {/* =========================
              BUTTON
          ========================= */}

          <button
            type="button"
            className="become-instructor-button"
            onClick={handleBecomeInstructor}
            disabled={loading}
          >
            {loading
              ? 'Creating Instructor Account...'
              : 'Become an Instructor →'}
          </button>

        </section>


        {/* =========================
            FUTURE FEATURES
        ========================= */}

        <section className="future-section">

          <span className="setup-label">
            INSTRUCTOR JOURNEY
          </span>

          <h2>
            Your Instructor Workspace
          </h2>

          <div className="future-list">

            <div>
              <span className="completed">
                ✓
              </span>

              Instructor profile
            </div>

            <div>
              <span className="completed">
                ✓
              </span>

              Weekly availability
            </div>

            <div>
              <span className="upcoming">
                ○
              </span>

              Student bookings
            </div>

            <div>
              <span className="upcoming">
                ○
              </span>

              Live video classroom
            </div>

            <div>
              <span className="upcoming">
                ○
              </span>

              Lesson management
            </div>

            <div>
              <span className="upcoming">
                ○
              </span>

              Payments
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default InstructorSetup;