import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../components/UserContext/UserContext';
import './Home.css';

function Home() {
  const { user, loading } = useUser();

  const primaryLink = loading
    ? '/login'
    : user
    ? '/video-lessons'
    : '/signup';

  const primaryText = loading
    ? 'Loading...'
    : user
    ? 'Start Learning'
    : 'Create Free Account';

  return (
    <div className="home">
      <main className="home-main">
        <section className="home-hero">
          <div className="hero-content">
            <p className="hero-small">
              <span className="hero-status-dot" />
              LEARN • PRACTICE • IMPROVE
            </p>

            <h1>
              Make Math
              <span> Easier.</span>
            </h1>

            <p className="hero-description">
              Build confidence in mathematics with step-by-step
              video lessons, interactive practice, and personalized
              learning support.
            </p>

            <div className="hero-buttons">
              <Link
                to={primaryLink}
                className="hero-primary-button"
                aria-disabled={loading}
                onClick={(event) => {
                  if (loading) event.preventDefault();
                }}
              >
                {primaryText} <span>→</span>
              </Link>

              <Link
                to={user ? '/instructors' : '/login'}
                className="hero-secondary-button"
              >
                Book a Lesson
              </Link>
            </div>

            <div className="hero-trust">
              <span>✓</span>
              Learn at your own pace
              <span className="trust-separator">·</span>
              <span>✓</span>
              Track your progress
            </div>
          </div>

          <div className="hero-logo-container">
            <div className="hero-glow" />
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />

            <div className="hero-logo-card">
              <img
                src="/GeonixIcon.png"
                className="App-logo"
                alt="Geonix Math Learning"
              />
              <div className="hero-logo-caption">
                <span className="hero-caption-icon">✦</span>
                Your journey to better math starts here
              </div>
            </div>

            <div className="floating-math floating-math-one">x²</div>
            <div className="floating-math floating-math-two">÷</div>
            <div className="floating-math floating-math-three">π</div>
          </div>
        </section>

        <section className="home-features" id="learning-options">
          <div className="section-heading">
            <p>YOUR LEARNING SPACE</p>
            <h2>Everything you need to grow</h2>
            <span>
              Choose how you want to learn and take the next step
              toward understanding math.
            </span>
          </div>

          <div className="features-grid">
            <article className="feature-card video-feature-card">
              <div className="feature-topline">
                <div className="feature-icon video-feature">▶</div>
                <span className="feature-tag">LEARN</span>
              </div>

              <h3>Math Video Lessons</h3>
              <p>
                Watch step-by-step lessons, review important
                concepts, and learn at a pace that works for you.
              </p>

              <Link to={user ? '/video-lessons' : '/signup'}>
                Explore Video Lessons <span>→</span>
              </Link>
            </article>

            <article className="feature-card">
              <div className="feature-topline">
                <div className="feature-icon practice-feature">∑</div>
                <span className="feature-tag">PRACTICE</span>
              </div>

              <h3>Interactive Practice</h3>
              <p>
                Practice different topics and challenge yourself
                with questions at different difficulty levels.
              </p>

              <Link to={user ? '/practice' : '/signup'}>
                Start Practicing <span>→</span>
              </Link>
            </article>

            <article className="feature-card">
              <div className="feature-topline">
                <div className="feature-icon progress-feature">↗</div>
                <span className="feature-tag">PROGRESS</span>
              </div>

              <h3>Track Your Progress</h3>
              <p>
                Review your results, monitor your accuracy, and
                discover the topics you can improve.
              </p>

              <Link to={user ? '/score' : '/signup'}>
                View My Progress <span>→</span>
              </Link>
            </article>

            <article className="feature-card">
              <div className="feature-topline">
                <div className="feature-icon instructor-feature">✦</div>
                <span className="feature-tag">PERSONAL SUPPORT</span>
              </div>

              <h3>Learn with an Instructor</h3>
              <p>
                Explore available instructors and find support
                for your individual learning goals.
              </p>

              <Link to={user ? '/instructors' : '/signup'}>
                Find an Instructor <span>→</span>
              </Link>
            </article>
          </div>
        </section>

        <section className="how-section">
          <div className="section-heading">
            <p>A SIMPLE APPROACH</p>
            <h2>Your learning journey, made easier</h2>
            <span>
              Build a learning routine that works for you.
            </span>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">🎯</div>
              <h3>Choose a topic</h3>
              <p>
                Start with a math topic or lesson you want to
                understand better.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">✏️</div>
              <h3>Learn and practice</h3>
              <p>
                Watch lessons, solve questions, and reinforce
                what you have learned.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">📈</div>
              <h3>Review your progress</h3>
              <p>
                Check your results and decide what to learn next.
              </p>
            </article>
          </div>
        </section>

        <section className="topics-section">
          <div className="topics-content">
            <p className="topics-small">EXPLORE MATH</p>
            <h2>One platform. Different math skills.</h2>
            <p>
              From everyday calculations to algebra and geometry,
              discover topics you can work on one step at a time.
            </p>

            <Link
              to={user ? '/practice' : '/signup'}
              className="topics-button"
            >
              Explore Math Practice →
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

        <section className="home-cta">
          <div className="cta-icon">🚀</div>

          <p className="cta-eyebrow">
            YOUR NEXT STEP STARTS HERE
          </p>

          <h2>
            {user
              ? 'Ready to keep learning?'
              : 'Make your next math milestone count.'}
          </h2>

          <p>
            {user
              ? 'Continue with video lessons, practice, or personal tutoring.'
              : 'Join Geonix and build your math skills one lesson at a time.'}
          </p>

          <div className="cta-buttons">
            <Link
              to={user ? '/video-lessons' : '/signup'}
              className="cta-button"
            >
              {user ? 'Start Learning →' : 'Get Started →'}
            </Link>

            <Link
              to={user ? '/instructors' : '/login'}
              className="cta-secondary-button"
            >
              {user ? 'Book a Lesson' : 'Already a Member? Log In'}
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-brand">
          <img src="/GeonixIcon.png" alt="" />
          <div>
            <strong>GEONIX</strong>
            <span>Learn. Practice. Improve.</span>
          </div>
        </div>

        <p>© {new Date().getFullYear()} Geonix. Keep learning!</p>
      </footer>
    </div>
  );
}

export default Home;