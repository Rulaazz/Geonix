import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../../components/UserContext/UserContext';
import './Profile.css';

const Profile = () => {
  const { user: currentUser, login } = useUser();

  const [user, setUser] = useState({
    name: '',
    email: '',
  });

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [progressLoading, setProgressLoading] = useState(true);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const accuracy =
    questionsAnswered > 0
      ? Math.round(
          (correctAnswers / questionsAnswered) * 100
        )
      : 0;

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);


  // =========================
  // LOAD PROGRESS
  // =========================

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          return;
        }

        const response = await axios.get(
          'http://localhost:5001/api/progress',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const progress = response.data.progress;

        setQuestionsAnswered(
          progress.questionsAnswered
        );

        setCorrectAnswers(
          progress.correctAnswers
        );

      } catch (error) {
        console.error(
          'GET PROFILE PROGRESS ERROR:',
          error
        );

      } finally {
        setProgressLoading(false);
      }
    };

    loadProgress();
  }, []);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser((previousUser) => ({
      ...previousUser,
      [name]: value,
    }));

    setSaved(false);
    setError('');
  };


  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      setError('You are not logged in.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const response = await axios.put(
        'http://localhost:5001/api/auth/me',
        {
          name: user.name,
          email: user.email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      // Update UserContext
      login(data.user);

      // Update local form
      setUser({
        name: data.user.name,
        email: data.user.email,
      });

      setSaved(true);

    } catch (error) {
      console.error(
        'PROFILE UPDATE ERROR:',
        error
      );

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(
          'Could not update profile.'
        );
      }

    } finally {
      setSaving(false);
    }
  };


  // =========================
  // FIRST LETTER
  // =========================

  const firstLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : 'S';


  return (
    <div className="profile-page">

      {/* ================= HEADER ================= */}

      <header className="profile-header">

        <div className="profile-nav">

          <Link
            to="/dashboard"
            className="profile-logo"
          >
            Geonix
          </Link>

          <nav className="profile-links">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/practice">
              Practice
            </Link>

            <Link to="/score">
              Progress
            </Link>

            <Link
              to="/profile"
              className="active"
            >
              Profile
            </Link>

          </nav>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="profile-main">

        {/* ================= INTRO ================= */}

        <section className="profile-intro">

          <p className="profile-small">
            Your learning space 👤
          </p>

          <h1>
            My Profile
          </h1>

          <p>
            See your progress, achievements, and account information.
          </p>

        </section>


        {/* ================= PROFILE HERO ================= */}

        <section className="profile-hero">

          <div className="profile-avatar-large">
            {firstLetter}
          </div>

          <div className="profile-hero-info">

            <h2>
              {user.name || 'Student'}
            </h2>

            <p>
              {user.email || 'Your email'}
            </p>

            <span className="student-badge">
              🎓 Geonix Student
            </span>

          </div>

        </section>


        {/* ================= STATISTICS ================= */}

        <section className="profile-statistics">

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              📝
            </div>

            <div className="profile-stat-number">
              {progressLoading
                ? '...'
                : questionsAnswered}
            </div>

            <div className="profile-stat-title">
              Questions
            </div>

          </div>


          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              ✅
            </div>

            <div className="profile-stat-number">
              {progressLoading
                ? '...'
                : correctAnswers}
            </div>

            <div className="profile-stat-title">
              Correct
            </div>

          </div>


          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              🎯
            </div>

            <div className="profile-stat-number">
              {progressLoading
                ? '...'
                : `${accuracy}%`}
            </div>

            <div className="profile-stat-title">
              Accuracy
            </div>

          </div>

        </section>


        {/* ================= CONTENT GRID ================= */}

        <section className="profile-content-grid">

          {/* ================= ACHIEVEMENTS ================= */}

          <div className="profile-section-card">

            <div className="profile-section-title">

              <div>

                <span className="section-icon">
                  🏆
                </span>

                <h3>
                  Achievements
                </h3>

              </div>

            </div>


            <div className="achievement-list">

              {/* FIRST STEP */}

              <div
                className={`achievement-item ${
                  questionsAnswered >= 1
                    ? 'unlocked'
                    : ''
                }`}
              >

                <div className="achievement-icon">
                  🌟
                </div>

                <div>

                  <h4>
                    First Step
                  </h4>

                  <p>
                    Answer your first question
                  </p>

                </div>

                {questionsAnswered >= 1 && (
                  <span className="achievement-check">
                    ✓
                  </span>
                )}

              </div>


              {/* PRACTICE STARTER */}

              <div
                className={`achievement-item ${
                  questionsAnswered >= 5
                    ? 'unlocked'
                    : ''
                }`}
              >

                <div className="achievement-icon">
                  📚
                </div>

                <div>

                  <h4>
                    Practice Starter
                  </h4>

                  <p>
                    Answer 5 questions
                  </p>

                </div>

                {questionsAnswered >= 5 && (
                  <span className="achievement-check">
                    ✓
                  </span>
                )}

              </div>


              {/* PRACTICE HERO */}

              <div
                className={`achievement-item ${
                  questionsAnswered >= 10
                    ? 'unlocked'
                    : ''
                }`}
              >

                <div className="achievement-icon">
                  🔥
                </div>

                <div>

                  <h4>
                    Practice Hero
                  </h4>

                  <p>
                    Answer 10 questions
                  </p>

                </div>

                {questionsAnswered >= 10 && (
                  <span className="achievement-check">
                    ✓
                  </span>
                )}

              </div>


              {/* MATH STAR */}

              <div
                className={`achievement-item ${
                  accuracy >= 90 &&
                  questionsAnswered >= 5
                    ? 'unlocked'
                    : ''
                }`}
              >

                <div className="achievement-icon">
                  🏅
                </div>

                <div>

                  <h4>
                    Math Star
                  </h4>

                  <p>
                    Reach 90% accuracy
                  </p>

                </div>

                {accuracy >= 90 &&
                  questionsAnswered >= 5 && (
                    <span className="achievement-check">
                      ✓
                    </span>
                  )}

              </div>

            </div>

          </div>


          {/* ================= QUICK ACTIONS ================= */}

          <div className="profile-section-card">

            <div className="profile-section-title">

              <div>

                <span className="section-icon">
                  ⚡
                </span>

                <h3>
                  Quick Actions
                </h3>

              </div>

            </div>


            <div className="quick-actions">

              <Link
                to="/practice"
                className="quick-action"
              >

                <div className="quick-action-icon">
                  🧮
                </div>

                <div>

                  <h4>
                    Practice Math
                  </h4>

                  <p>
                    Test your skills
                  </p>

                </div>

                <span>
                  →
                </span>

              </Link>


              <Link
                to="/score"
                className="quick-action"
              >

                <div className="quick-action-icon">
                  📊
                </div>

                <div>

                  <h4>
                    View Progress
                  </h4>

                  <p>
                    Check your results
                  </p>

                </div>

                <span>
                  →
                </span>

              </Link>


              <Link
                to="/dashboard"
                className="quick-action"
              >

                <div className="quick-action-icon">
                  🏠
                </div>

                <div>

                  <h4>
                    Dashboard
                  </h4>

                  <p>
                    Return home
                  </p>

                </div>

                <span>
                  →
                </span>

              </Link>

            </div>

          </div>

        </section>


        {/* ================= EDIT PROFILE ================= */}

        <section className="edit-profile-card">

          <div className="edit-profile-header">

            <div>

              <p className="edit-small">
                Account settings
              </p>

              <h3>
                Edit Profile
              </h3>

              <p>
                Update your personal information.
              </p>

            </div>

            <div className="edit-icon">
              ✏️
            </div>

          </div>


          <form onSubmit={handleSave}>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>


            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>


            {saved && (
              <div className="success-message">
                ✓ Your profile has been saved successfully.
              </div>
            )}


            {error && (
              <div className="error-message">
                ✕ {error}
              </div>
            )}

          </form>

        </section>


        {/* ================= BACK ================= */}

        <Link
          to="/dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </Link>

      </main>

    </div>
  );
};

export default Profile;
