
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Score.css';

const categoryNames = {
  addition: 'Addition & Subtraction',
  multiplication: 'Multiplication & Division',
  fractions: 'Fractions',
  algebra: 'Algebra',
  geometry: 'Geometry',
};

const categoryIcons = {
  addition: '➕',
  multiplication: '✖️',
  fractions: '🔢',
  algebra: '📐',
  geometry: '📏',
};

const Score = () => {
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [categoryProgress, setCategoryProgress] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('You are not logged in.');
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
          progress.questionsAnswered || 0
        );

        setCorrectAnswers(
          progress.correctAnswers || 0
        );

        setCategoryProgress(
          progress.categoryProgress || {}
        );

      } catch (error) {
        console.error(
          'GET PROGRESS ERROR:',
          error
        );

        setError(
          'Could not load your progress.'
        );

      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const percentage =
    questionsAnswered > 0
      ? Math.round(
          (correctAnswers / questionsAnswered) * 100
        )
      : 0;

  const getMessage = () => {
    if (questionsAnswered === 0) {
      return 'Start practicing to see your progress!';
    }

    if (percentage >= 90) {
      return 'Excellent work! You are doing amazing! 🌟';
    }

    if (percentage >= 70) {
      return 'Great job! Keep building your skills! 👏';
    }

    if (percentage >= 50) {
      return 'Good effort! Keep practicing! 💪';
    }

    return 'Keep practicing and you will improve! 📚';
  };

  const getCategoryAccuracy = (category) => {
    const progress = categoryProgress[category];

    if (!progress || progress.questionsAnswered === 0) {
      return 0;
    }

    return Math.round(
      (progress.correctAnswers /
        progress.questionsAnswered) *
        100
    );
  };

  const getCategoryMessage = (category) => {
    const progress = categoryProgress[category];

    if (!progress || progress.questionsAnswered === 0) {
      return 'Not started yet';
    }

    const accuracy = getCategoryAccuracy(category);

    if (accuracy >= 90) {
      return 'Excellent! 🌟';
    }

    if (accuracy >= 70) {
      return 'Doing great! 👏';
    }

    if (accuracy >= 50) {
      return 'Keep practicing! 💪';
    }

    return 'More practice needed 📚';
  };

  return (
    <div className="score-page">

      {/* HEADER */}
      <header className="score-header">

        <div className="score-nav">

          <Link
            to="/dashboard"
            className="score-logo"
          >
            Geonix
          </Link>

          <nav className="score-links">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/practice">
              Practice
            </Link>

            <Link
              to="/score"
              className="active"
            >
              Progress
            </Link>

            <Link to="/profile">
              Profile
            </Link>

          </nav>

        </div>

      </header>

      {/* MAIN */}
      <main className="score-main">

        {/* INTRO */}
        <section className="score-intro">

          <p className="score-small">
            Your learning journey 📊
          </p>

          <h1>
            My Progress
          </h1>

          <p>
            Track your math practice and see how
            you are improving across different topics.
          </p>

        </section>

        {loading ? (

          <section className="score-card">
            <h2>
              Loading your progress...
            </h2>
          </section>

        ) : error ? (

          <section className="score-card">
            <h2>
              {error}
            </h2>
          </section>

        ) : (

          <>

            {/* OVERALL PROGRESS */}
            <section className="overall-progress-card">

              <div className="overall-circle">

                <div className="overall-percentage">
                  {percentage}%
                </div>

                <div className="overall-label">
                  Accuracy
                </div>

              </div>

              <div className="overall-content">

                <p className="overall-small">
                  Your overall performance
                </p>

                <h2>
                  {getMessage()}
                </h2>

                <p>
                  You have answered{' '}
                  <strong>
                    {questionsAnswered}
                  </strong>{' '}
                  questions and got{' '}
                  <strong>
                    {correctAnswers}
                  </strong>{' '}
                  correct.
                </p>

              </div>

            </section>

            {/* STATISTICS */}
            <section className="score-stats">

              <div className="score-stat">

                <div className="score-stat-icon">
                  📝
                </div>

                <div className="score-stat-number">
                  {questionsAnswered}
                </div>

                <div className="score-stat-title">
                  Questions Answered
                </div>

              </div>

              <div className="score-stat">

                <div className="score-stat-icon">
                  ✅
                </div>

                <div className="score-stat-number">
                  {correctAnswers}
                </div>

                <div className="score-stat-title">
                  Correct Answers
                </div>

              </div>

              <div className="score-stat">

                <div className="score-stat-icon">
                  🎯
                </div>

                <div className="score-stat-number">
                  {percentage}%
                </div>

                <div className="score-stat-title">
                  Accuracy
                </div>

              </div>

            </section>

            {/* CATEGORY PROGRESS */}
            <section className="category-progress-section">

              <div className="category-progress-header">

                <div>
                  <p className="category-small">
                    Topic performance
                  </p>

                  <h2>
                    Progress by Category
                  </h2>
                </div>

                <span className="category-count">
                  5 Topics
                </span>

              </div>

              <div className="category-progress-grid">

                {Object.keys(categoryNames).map(
                  (category) => {

                    const progress =
                      categoryProgress[category];

                    const answered =
                      progress?.questionsAnswered || 0;

                    const correct =
                      progress?.correctAnswers || 0;

                    const accuracy =
                      getCategoryAccuracy(category);

                    return (
                      <div
                        key={category}
                        className="category-progress-card"
                      >

                        <div className="category-card-top">

                          <div className="category-icon">
                            {categoryIcons[category]}
                          </div>

                          <div className="category-card-title">

                            <h3>
                              {categoryNames[category]}
                            </h3>

                            <p>
                              {getCategoryMessage(
                                category
                              )}
                            </p>

                          </div>

                          <div className="category-percentage">
                            {accuracy}%
                          </div>

                        </div>

                        <div className="progress-bar-background">

                          <div
                            className={`progress-bar-fill progress-${category}`}
                            style={{
                              width: `${accuracy}%`,
                            }}
                          />

                        </div>

                        <div className="category-card-bottom">

                          <span>
                            {answered} questions
                          </span>

                          <span>
                            {correct} correct
                          </span>

                        </div>

                        <Link
                          to="/practice"
                          className="category-practice-link"
                        >
                          Practice this topic →
                        </Link>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* MOTIVATION */}
            <section className="progress-motivation">

              <div className="motivation-icon">
                🚀
              </div>

              <div>

                <h3>
                  Keep your learning momentum!
                </h3>

                <p>
                  Regular practice helps you remember
                  what you learn and become more confident.
                </p>

              </div>

              <Link
                to="/practice"
                className="motivation-button"
              >
                Practice Now →
              </Link>

            </section>

            {/* BACK */}
            <Link
              to="/dashboard"
              className="score-back-link"
            >
              ← Back to Dashboard
            </Link>

          </>

        )}

      </main>

    </div>
  );
};

export default Score;
