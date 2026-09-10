
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import { useUser } from '../../components/UserContext/UserContext';

const Dashboard = () => {
  const navigate = useNavigate();

  const { user, logout } = useUser();

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD USER PROGRESS
  // =========================

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setLoading(false);
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
          'GET DASHBOARD PROGRESS ERROR:',
          error
        );

      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);


  // =========================
  // CALCULATE SCORE
  // =========================

  const currentScore =
    questionsAnswered > 0
      ? Math.round(
          (correctAnswers / questionsAnswered) * 100
        )
      : 0;


  // =========================
  // LEARNING STATUS
  // =========================

  const getLearningStatus = () => {
    if (questionsAnswered === 0) {
      return 'Start your first practice session!';
    }

    if (questionsAnswered < 5) {
      return 'Great start! Keep practicing!';
    }

    if (currentScore >= 90) {
      return 'Excellent work! You are a math star! 🌟';
    }

    if (currentScore >= 70) {
      return 'Great progress! Keep going! 👏';
    }

    return 'Keep practicing and you will improve! 💪';
  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <header className="dashboard-header">

        <div className="dashboard-nav">

          <Link
            to="/dashboard"
            className="logo"
          >
            Geonix
          </Link>


          <nav className="nav-links">

            <Link
              to="/dashboard"
              className="active"
            >
              Dashboard
            </Link>

            <Link to="/practice">
              Practice
            </Link>

            <Link to="/score">
              Progress
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>

          </nav>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* ================= WELCOME CARD ================= */}

        <section className="welcome-card">

          <p className="welcome-small">
            Welcome back 👋
          </p>

          <h1>
            Hi, {user?.name || 'Student'}!
          </h1>

          <p className="welcome-text">
            {getLearningStatus()}
          </p>

          <Link
            to="/practice"
            className="practice-button"
          >
            Start Practicing →
          </Link>

        </section>


        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {/* Questions */}

          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div className="stat-title">
              Questions Answered
            </div>

            <div className="stat-number">
              {loading
                ? '...'
                : questionsAnswered}
            </div>

          </div>


          {/* Correct Answers */}

          <div className="stat-card">

            <div className="stat-icon">
              ✅
            </div>

            <div className="stat-title">
              Correct Answers
            </div>

            <div className="stat-number">
              {loading
                ? '...'
                : correctAnswers}
            </div>

          </div>


          {/* Accuracy */}

          <div className="stat-card">

            <div className="stat-icon">
              ⭐
            </div>

            <div className="stat-title">
              Current Score
            </div>

            <div className="stat-number">
              {loading
                ? '...'
                : `${currentScore}%`}
            </div>

          </div>

        </section>


        {/* ================= LEARNING SECTION ================= */}

        <section className="learning-section">

          <h2 className="learning-title">
            Continue Learning
          </h2>


          <div className="learning-grid">

            {/* ================= PRACTICE ================= */}

            <Link
              to="/practice"
              className="learning-card"
            >

              <div className="card-icon practice-icon">
                📘
              </div>

              <h3>
                Practice
              </h3>

              <p>
                Solve math questions and improve your skills one question at a time.
              </p>

              <span className="card-link practice-link">
                Start practicing →
              </span>

            </Link>


            {/* ================= PROGRESS ================= */}

            <Link
              to="/score"
              className="learning-card"
            >

              <div className="card-icon progress-icon">
                📊
              </div>

              <h3>
                My Progress
              </h3>

              <p>
                See your scores, accuracy, and track your learning progress.
              </p>

              <span className="card-link progress-link">
                View progress →
              </span>

            </Link>


            {/* ================= PROFILE ================= */}

            <Link
              to="/profile"
              className="learning-card"
            >

              <div className="card-icon profile-icon">
                👤
              </div>

              <h3>
                My Profile
              </h3>

              <p>
                Manage your account and see your achievements.
              </p>

              <span className="card-link profile-link">
                View profile →
              </span>

            </Link>

          </div>

        </section>


        {/* ================= LEARNING TIP ================= */}

        <section className="dashboard-tip">

          <div className="tip-icon">
            💡
          </div>

          <div>

            <h3>
              Today's Learning Tip
            </h3>

            <p>
              Practice a little every day. Consistent practice
              helps you become faster and more confident with math.
            </p>

          </div>

        </section>


        {/* ================= ACHIEVEMENT ================= */}

        <section className="dashboard-achievement">

          <div className="achievement-dashboard-icon">
            🏆
          </div>

          <div className="achievement-dashboard-content">

            <p className="achievement-dashboard-small">
              Your next milestone
            </p>

            <h3>
              {questionsAnswered >= 10
                ? 'Practice Hero unlocked! 🔥'
                : `${10 - questionsAnswered} more question${
                    10 - questionsAnswered === 1
                      ? ''
                      : 's'
                  } to become a Practice Hero`}
            </h3>

            <p>
              Keep answering questions to unlock more Geonix achievements.
            </p>

          </div>

          <Link
            to="/profile"
            className="achievement-dashboard-link"
          >
            View achievements →
          </Link>

        </section>

      </main>

    </div>
  );
};

export default Dashboard;
