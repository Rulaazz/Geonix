import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import logo from './GeonixIcon.png';
import './Home.css';
import { useUser } from '../../components/UserContext/UserContext';

function Home() {
  const { user, loading } = useUser();

  return (
    <div className="home">

      <Header />

      <main className="home-main">

        {/* HERO */}

        <section className="home-hero">

          <div className="hero-content">

            <p className="hero-small">
              🧠 Learn • Practice • Improve
            </p>

            <h1>
              Make Math
              <span> Easier.</span>
            </h1>

            <p className="hero-description">
              Geonix helps you practice math, improve your
              skills, and track your progress one question
              at a time.
            </p>

            <div className="hero-buttons">

              {!loading && user ? (
                <Link
                  to="/dashboard"
                  className="hero-primary-button"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="hero-primary-button"
                >
                  Start Learning →
                </Link>
              )}

              <Link
                to="/practice"
                className="hero-secondary-button"
              >
                Try Practice
              </Link>

            </div>

          </div>


          {/* LOGO */}

          <div className="hero-logo-container">

            <div className="hero-glow"></div>

            <img
              src={logo}
              className="App-logo"
              alt="Geonix logo"
            />

          </div>

        </section>


        {/* FEATURES */}

        <section className="home-features">

          <div className="section-heading">

            <p>
              WHY GEONIX?
            </p>

            <h2>
              Everything you need to improve
            </h2>

            <span>
              Practice at your own pace and see your
              progress grow over time.
            </span>

          </div>


          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-icon practice-feature">
                🧮
              </div>

              <h3>
                Smart Practice
              </h3>

              <p>
                Choose different math topics and
                difficulty levels to challenge yourself.
              </p>

              <Link to="/practice">
                Practice now →
              </Link>

            </div>


            <div className="feature-card">

              <div className="feature-icon progress-feature">
                📊
              </div>

              <h3>
                Track Progress
              </h3>

              <p>
                See your accuracy, answered questions,
                and progress across different topics.
              </p>

              <Link
                to={user ? '/score' : '/signup'}
              >
                {user
                  ? 'View progress →'
                  : 'Start tracking →'}
              </Link>

            </div>


            <div className="feature-card">

              <div className="feature-icon achievement-feature">
                🏆
              </div>

              <h3>
                Achievements
              </h3>

              <p>
                Keep practicing and unlock achievements
                as you reach new milestones.
              </p>

              <Link
                to={user ? '/profile' : '/signup'}
              >
                {user
                  ? 'View achievements →'
                  : 'Get started →'}
              </Link>

            </div>

          </div>

        </section>


        {/* HOW IT WORKS */}

        <section className="how-section">

          <div className="section-heading">

            <p>
              HOW IT WORKS
            </p>

            <h2>
              Start learning in three simple steps
            </h2>

          </div>


          <div className="steps-grid">

            <div className="step-card">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                🎯
              </div>

              <h3>
                Choose a topic
              </h3>

              <p>
                Pick the math category you want
                to practice.
              </p>

            </div>


            <div className="step-card">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                ✏️
              </div>

              <h3>
                Solve questions
              </h3>

              <p>
                Answer questions and challenge
                yourself at different levels.
              </p>

            </div>


            <div className="step-card">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                📈
              </div>

              <h3>
                Watch your progress
              </h3>

              <p>
                Track your results and discover
                where you can improve.
              </p>

            </div>

          </div>

        </section>


        {/* TOPICS */}

        <section className="topics-section">

          <div className="topics-content">

            <p className="topics-small">
              EXPLORE MATH
            </p>

            <h2>
              Practice different math skills
            </h2>

            <p>
              From basic calculations to algebra and
              geometry, Geonix gives you different ways
              to strengthen your math skills.
            </p>

            <Link
              to="/practice"
              className="topics-button"
            >
              Explore Practice →
            </Link>

          </div>


          <div className="topics-grid">

            <div className="topic-item">
              <span>➕</span>
              <strong>Addition</strong>
            </div>

            <div className="topic-item">
              <span>✖️</span>
              <strong>Multiplication</strong>
            </div>

            <div className="topic-item">
              <span>🔢</span>
              <strong>Fractions</strong>
            </div>

            <div className="topic-item">
              <span>📐</span>
              <strong>Algebra</strong>
            </div>

            <div className="topic-item">
              <span>📏</span>
              <strong>Geometry</strong>
            </div>

          </div>

        </section>


        {/* FINAL CTA */}

        <section className="home-cta">

          <div className="cta-icon">
            🚀
          </div>

          <h2>
            {user
              ? 'Ready for more practice?'
              : 'Ready to improve your math skills?'}
          </h2>

          <p>
            {user
              ? 'Continue practicing and keep building your Geonix progress.'
              : 'Create your Geonix account and start practicing today.'}
          </p>

          <Link
            to={user ? '/dashboard' : '/signup'}
            className="cta-button"
          >
            {user
              ? 'Go to Dashboard →'
              : 'Create Your Account →'}
          </Link>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="home-footer">

        <div>

          <strong>
            Geonix
          </strong>

          <span>
            Learn. Practice. Improve.
          </span>

        </div>

        <p>
          © 2026 Geonix. Keep learning! 🧠
        </p>

      </footer>

    </div>
  );
}

export default Home;