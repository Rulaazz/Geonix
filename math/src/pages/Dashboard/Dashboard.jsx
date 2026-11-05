import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import './Dashboard.css';

import { useUser } from '../../components/UserContext/UserContext';

/* =========================
   VIDEO LESSONS
========================= */

const videoLessons = [
  {
    id: 'algebra-basics',
    title: 'Algebra Basics',
  },
  {
    id: 'fractions-basics',
    title: 'Fractions Basics',
  },
  {
    id: 'geometry-basics',
    title: 'Geometry Basics',
  },
  {
    id: 'multiplication-division',
    title: 'Multiplication & Division',
  },
  {
    id: 'linear-equations',
    title: 'Linear Equations',
  },
  {
    id: 'advanced-geometry',
    title: 'Advanced Geometry',
  },
];

/* =========================
   DASHBOARD
========================= */

const Dashboard = () => {
  const { user } = useUser();

  /* =========================
     PRACTICE PROGRESS
  ========================= */

  const [progress, setProgress] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    categoryProgress: {},
  });

  const [loadingProgress, setLoadingProgress] = useState(true);

  /* =========================
     VIDEO PROGRESS
  ========================= */

  const [completedLessons, setCompletedLessons] = useState([]);

  const [loadingVideoProgress, setLoadingVideoProgress] =
    useState(true);

  /* =========================
     MY LESSONS
  ========================= */

  const [bookings, setBookings] = useState([]);

  const [loadingBookings, setLoadingBookings] =
    useState(true);

  /* =========================
     GET PRACTICE PROGRESS
  ========================= */

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoadingProgress(false);
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:5001/api/progress',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.progress) {
          setProgress(response.data.progress);
        }
      } catch (error) {
        console.error(
          'Could not load dashboard progress:',
          error
        );
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgress();
  }, []);

  /* =========================
     GET VIDEO PROGRESS
  ========================= */

  useEffect(() => {
    const loadVideoProgress = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoadingVideoProgress(false);
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:5001/api/lesson-progress',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const progressList =
          response.data?.progress || [];

        const completed = progressList
          .filter(
            (lesson) => lesson.completed === true
          )
          .map(
            (lesson) => lesson.lessonId
          );

        setCompletedLessons(completed);
      } catch (error) {
        console.error(
          'Could not load video lesson progress:',
          error
        );
      } finally {
        setLoadingVideoProgress(false);
      }
    };

    loadVideoProgress();
  }, []);

  /* =========================
     GET MY BOOKINGS
  ========================= */

  useEffect(() => {
    const loadBookings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoadingBookings(false);
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:5001/api/bookings/my',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const bookingList =
          response.data?.bookings || [];

        setBookings(bookingList);
      } catch (error) {
        console.error(
          'Could not load dashboard bookings:',
          error
        );
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, []);

  /* =========================
     PRACTICE STATISTICS
  ========================= */

  const questionsAnswered =
    progress.questionsAnswered || 0;

  const correctAnswers =
    progress.correctAnswers || 0;

  const currentScore =
    questionsAnswered > 0
      ? Math.round(
          (correctAnswers / questionsAnswered) * 100
        )
      : 0;

  /* =========================
     VIDEO STATISTICS
  ========================= */

  const totalVideoLessons =
    videoLessons.length;

  const completedVideoLessons =
    completedLessons.length;

  const videoProgress =
    totalVideoLessons > 0
      ? Math.round(
          (completedVideoLessons /
            totalVideoLessons) *
            100
        )
      : 0;

  /* =========================
     FIND NEXT VIDEO LESSON
  ========================= */

  const nextLesson =
    videoLessons.find(
      (lesson) =>
        !completedLessons.includes(lesson.id)
    );

  /* =========================
     FIND UPCOMING BOOKING
  ========================= */

  const getUpcomingBooking = () => {
    if (!bookings.length) {
      return null;
    }

    const now = new Date();

    const upcoming = bookings
      .filter(
        (booking) =>
          booking.status === 'pending' ||
          booking.status === 'confirmed'
      )
      .filter((booking) => {
        const bookingDate = new Date(
          `${booking.date}T${booking.startTime || '00:00'}`
        );

        return bookingDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(
          `${a.date}T${a.startTime || '00:00'}`
        );

        const dateB = new Date(
          `${b.date}T${b.startTime || '00:00'}`
        );

        return dateA - dateB;
      });

    return upcoming[0] || null;
  };

  const upcomingBooking =
    getUpcomingBooking();

  /* =========================
     BOOKING STATISTICS
  ========================= */

  const totalBookings =
    bookings.length;

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.status === 'confirmed'
    ).length;

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.status === 'pending'
    ).length;

  /* =========================
     FORMAT DATE
  ========================= */

  const formatBookingDate = (date) => {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'en-US',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  /* =========================
     GET INSTRUCTOR NAME
  ========================= */

  const getInstructorName = (booking) => {
    if (booking?.instructor?.name) {
      return booking.instructor.name;
    }

    if (booking?.instructorName) {
      return booking.instructorName;
    }

    return 'Math Instructor';
  };

  /* =========================
     CATEGORY DATA
  ========================= */

  const categories = [
    {
      key: 'addition',
      name: 'Addition',
      icon: '➕',
    },
    {
      key: 'multiplication',
      name: 'Multiplication',
      icon: '✖️',
    },
    {
      key: 'fractions',
      name: 'Fractions',
      icon: '🔢',
    },
    {
      key: 'algebra',
      name: 'Algebra',
      icon: '📐',
    },
    {
      key: 'geometry',
      name: 'Geometry',
      icon: '📏',
    },
  ];

  return (
    <div className="dashboard-page">

      {/* =========================
          MAIN
      ========================= */}

      <main className="dashboard-main">

        {/* =========================
            WELCOME
        ========================= */}

        <section className="welcome-card">

          <div className="welcome-content">

            <p className="welcome-small">
              Welcome back 👋
            </p>

            <h1>
              Hi, {user?.name || 'Student'}!
            </h1>

            <p className="welcome-text">
              Ready to improve your math skills today?
            </p>

            <Link
              to="/practice"
              className="practice-button"
            >
              Start Practicing →
            </Link>

          </div>

          <div className="welcome-decoration">
            🧮
          </div>

        </section>

        {/* =========================
            UPCOMING LESSON
        ========================= */}

        <section className="upcoming-lesson-card">

          <div className="upcoming-lesson-header">

            <div>

              <p className="section-small">
                YOUR SCHEDULE
              </p>

              <h2 className="learning-title">
                Upcoming Lesson
              </h2>

            </div>

            <Link
              to="/my-lessons"
              className="view-all-link"
            >
              View My Lessons →
            </Link>

          </div>

          {loadingBookings ? (

            <div className="upcoming-loading">
              Loading your lessons...
            </div>

          ) : upcomingBooking ? (

            <div className="upcoming-lesson-content">

              <div className="upcoming-lesson-icon">
                📅
              </div>

              <div className="upcoming-lesson-details">

                <span className="upcoming-status">
                  {upcomingBooking.status === 'confirmed'
                    ? '✓ Confirmed'
                    : '⏳ Waiting for confirmation'}
                </span>

                <h3>
                  Math Lesson with{' '}
                  {getInstructorName(
                    upcomingBooking
                  )}
                </h3>

                <div className="upcoming-lesson-meta">

                  <span>
                    📅{' '}
                    {formatBookingDate(
                      upcomingBooking.date
                    )}
                  </span>

                  <span>
                    🕐{' '}
                    {upcomingBooking.startTime}
                    {' – '}
                    {upcomingBooking.endTime}
                  </span>

                </div>

                {upcomingBooking.topic && (
                  <p className="upcoming-topic">
                    <strong>Topic:</strong>{' '}
                    {upcomingBooking.topic}
                  </p>
                )}

              </div>

              <Link
                to="/my-lessons"
                className="upcoming-button"
              >
                View Lesson →
              </Link>

            </div>

          ) : (

            <div className="no-upcoming-lesson">

              <div className="no-upcoming-icon">
                📚
              </div>

              <div>

                <h3>
                  No upcoming lessons
                </h3>

                <p>
                  Find an instructor and schedule
                  your next math lesson.
                </p>

              </div>

              <Link
                to="/instructors"
                className="find-instructor-button"
              >
                Find an Instructor →
              </Link>

            </div>

          )}

        </section>

        {/* =========================
            VIDEO LEARNING PROGRESS
        ========================= */}

        <section className="video-progress-card">

          <div className="video-progress-top">

            <div className="video-progress-icon">
              🎥
            </div>

            <div className="video-progress-heading">

              <span className="dashboard-feature-label">
                YOUR VIDEO LEARNING
              </span>

              <h2>
                Math Video Lessons
              </h2>

              <p>
                Continue learning through guided
                math lessons and build your skills
                step by step.
              </p>

            </div>

            <div className="video-progress-percentage">

              {loadingVideoProgress
                ? '...'
                : `${videoProgress}%`}

            </div>

          </div>

          <div className="video-progress-bar">

            <div
              className="video-progress-fill"
              style={{
                width: `${videoProgress}%`,
              }}
            />

          </div>

          <div className="video-progress-info">

            <span>
              {loadingVideoProgress
                ? 'Loading lesson progress...'
                : `${completedVideoLessons} of ${totalVideoLessons} lessons completed`}
            </span>

            <span>
              {videoProgress}% complete
            </span>

          </div>

          <div className="video-progress-actions">

            {nextLesson ? (

              <Link
                to={`/video-lessons/${nextLesson.id}`}
                className="continue-video-button"
              >
                ▶ Continue Learning
              </Link>

            ) : (

              <Link
                to="/video-lessons"
                className="continue-video-button"
              >
                ✓ Review Lessons
              </Link>

            )}

            <Link
              to="/video-lessons"
              className="all-video-button"
            >
              View All Lessons →
            </Link>

          </div>

        </section>

        {/* =========================
            STATISTICS
        ========================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div className="stat-content">

              <div className="stat-title">
                Questions Answered
              </div>

              <div className="stat-number">
                {loadingProgress
                  ? '...'
                  : questionsAnswered}
              </div>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ✅
            </div>

            <div className="stat-content">

              <div className="stat-title">
                Correct Answers
              </div>

              <div className="stat-number">
                {loadingProgress
                  ? '...'
                  : correctAnswers}
              </div>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ⭐
            </div>

            <div className="stat-content">

              <div className="stat-title">
                Current Score
              </div>

              <div className="stat-number">
                {loadingProgress
                  ? '...'
                  : `${currentScore}%`}
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            LESSON STATISTICS
        ========================= */}

        <section className="lesson-stats-grid">

          <Link
            to="/my-lessons"
            className="lesson-stat-card"
          >

            <div className="lesson-stat-icon">
              📅
            </div>

            <div className="lesson-stat-content">

              <span>
                My Lessons
              </span>

              <strong>
                {loadingBookings
                  ? '...'
                  : totalBookings}
              </strong>

              <small>
                Total bookings
              </small>

            </div>

          </Link>

          <Link
            to="/my-lessons"
            className="lesson-stat-card"
          >

            <div className="lesson-stat-icon confirmed">
              ✓
            </div>

            <div className="lesson-stat-content">

              <span>
                Confirmed
              </span>

              <strong>
                {loadingBookings
                  ? '...'
                  : confirmedBookings}
              </strong>

              <small>
                Scheduled lessons
              </small>

            </div>

          </Link>

          <Link
            to="/my-lessons"
            className="lesson-stat-card"
          >

            <div className="lesson-stat-icon pending">
              ⏳
            </div>

            <div className="lesson-stat-content">

              <span>
                Pending
              </span>

              <strong>
                {loadingBookings
                  ? '...'
                  : pendingBookings}
              </strong>

              <small>
                Waiting for confirmation
              </small>

            </div>

          </Link>

        </section>

        {/* =========================
            CATEGORY PROGRESS
        ========================= */}

        <section className="category-section">

          <div className="category-section-header">

            <div>

              <p className="section-small">
                YOUR SKILLS
              </p>

              <h2 className="learning-title">
                Math Categories
              </h2>

            </div>

            <Link
              to="/score"
              className="view-all-link"
            >
              View Progress →
            </Link>

          </div>

          <div className="category-grid">

            {categories.map((category) => {

              const categoryData =
                progress.categoryProgress?.[
                  category.key
                ];

              const answered =
                categoryData?.questionsAnswered || 0;

              const correct =
                categoryData?.correctAnswers || 0;

              const percentage =
                answered > 0
                  ? Math.round(
                      (correct / answered) * 100
                    )
                  : 0;

              return (
                <div
                  className="category-card"
                  key={category.key}
                >

                  <div className="category-top">

                    <div className="category-icon">
                      {category.icon}
                    </div>

                    <div className="category-info">

                      <h3>
                        {category.name}
                      </h3>

                      <span>
                        {answered} questions
                      </span>

                    </div>

                    <div className="category-percentage">
                      {percentage}%
                    </div>

                  </div>

                  <div className="progress-bar">

                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <div className="category-bottom">

                    <span>
                      {correct} correct
                    </span>

                    <Link to="/practice">
                      Practice →
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* =========================
            CONTINUE LEARNING
        ========================= */}

        <section className="learning-section">

          <div className="learning-section-header">

            <div>

              <p className="section-small">
                KEEP GOING
              </p>

              <h2 className="learning-title">
                Continue Learning
              </h2>

            </div>

            <Link
              to="/practice"
              className="view-all-link"
            >
              View Practice →
            </Link>

          </div>

          <div className="learning-grid">

            {/* VIDEO LESSONS */}

            <Link
              to="/video-lessons"
              className="learning-card"
            >

              <div className="card-icon video-icon">
                🎥
              </div>

              <h3>
                Video Lessons
              </h3>

              <p>
                Watch guided math lessons and learn
                important concepts step by step.
              </p>

              <span className="card-link video-link">
                {completedVideoLessons > 0
                  ? `${completedVideoLessons}/${totalVideoLessons} completed →`
                  : 'Start learning →'}
              </span>

            </Link>

            {/* MY LESSONS */}

            <Link
              to="/my-lessons"
              className="learning-card"
            >

              <div className="card-icon lessons-icon">
                📅
              </div>

              <h3>
                My Lessons
              </h3>

              <p>
                View your scheduled math lessons,
                booking requests, and upcoming classes.
              </p>

              <span className="card-link lessons-link">
                {totalBookings > 0
                  ? `${totalBookings} booking${
                      totalBookings === 1
                        ? ''
                        : 's'
                    } →`
                  : 'Find a lesson →'}
              </span>

            </Link>

            {/* PRACTICE */}

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
                Solve math questions and improve your
                skills.
              </p>

              <span className="card-link practice-link">
                Start practicing →
              </span>

            </Link>

            {/* PROGRESS */}

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
                See your scores and track your learning
                progress.
              </p>

              <span className="card-link progress-link">
                View progress →
              </span>

            </Link>

            {/* PROFILE */}

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
                Manage your account and personal
                information.
              </p>

              <span className="card-link profile-link">
                View profile →
              </span>

            </Link>

          </div>

        </section>

      </main>
    </div>
  );
};

export default Dashboard;