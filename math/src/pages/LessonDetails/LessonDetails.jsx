
import React from 'react';
import {
  Link,
  useParams,
} from 'react-router-dom';

import VideoLesson from '../../components/VideoLesson/VideoLessons';

import './LessonDetails.css';

/* =========================
   LESSON DATA
========================= */

const lessons = [
  {
    id: 'algebra-basics',
    title: 'Algebra Basics',
    category: 'Algebra',
    level: 'Beginner',
    duration: '45 min',
    teacher: 'Geonix Teacher',

    description:
      'Learn the basic concepts of algebra, variables, expressions, and simple equations.',

    videoUrl:
      'https://www.youtube.com/watch?v=Z7tR-6h3M7Y',

    notes:
      'In this lesson you will learn what variables are, how algebraic expressions work, and how to solve simple equations step by step.',

    availableTimes: [
      'Sunday, 17:00',
      'Monday, 18:30',
      'Wednesday, 16:00',
    ],
  },

  {
    id: 'fractions-basics',
    title: 'Understanding Fractions',
    category: 'Fractions',
    level: 'Beginner',
    duration: '30 min',
    teacher: 'Geonix Teacher',

    description:
      'Understand fractions, equivalent fractions, comparing fractions, and basic operations.',

    videoUrl:
      'https://www.youtube.com/watch?v=5Vb5R4P4b1Y',

    notes:
      'We will learn how fractions represent parts of a whole and how to compare and work with basic fractions.',

    availableTimes: [
      'Sunday, 16:00',
      'Tuesday, 17:30',
      'Thursday, 18:00',
    ],
  },

  {
    id: 'geometry-basics',
    title: 'Geometry Basics',
    category: 'Geometry',
    level: 'Beginner',
    duration: '40 min',
    teacher: 'Geonix Teacher',

    description:
      'Explore shapes, angles, perimeter, area, and the foundations of geometry.',

    videoUrl:
      'https://www.youtube.com/watch?v=OmJ-4B-mS-Y',

    notes:
      'This lesson introduces common geometric shapes, angles, perimeter, and area calculations.',

    availableTimes: [
      'Monday, 16:00',
      'Wednesday, 17:30',
      'Saturday, 11:00',
    ],
  },

  {
    id: 'multiplication-division',
    title: 'Multiplication & Division',
    category: 'Multiplication',
    level: 'Beginner',
    duration: '35 min',
    teacher: 'Geonix Teacher',

    description:
      'Practice multiplication and division using simple strategies and examples.',

    videoUrl:
      'https://www.youtube.com/watch?v=Z7tR-6h3M7Y',

    notes:
      'Practice multiplication and division using visual examples and step-by-step explanations.',

    availableTimes: [
      'Sunday, 15:00',
      'Tuesday, 16:30',
      'Friday, 14:00',
    ],
  },

  {
    id: 'linear-equations',
    title: 'Linear Equations',
    category: 'Algebra',
    level: 'Intermediate',
    duration: '50 min',
    teacher: 'Geonix Teacher',

    description:
      'Learn how to solve linear equations step by step and understand their structure.',

    videoUrl:
      'https://www.youtube.com/watch?v=Z7tR-6h3M7Y',

    notes:
      'You will learn how to isolate variables and solve linear equations using mathematical operations.',

    availableTimes: [
      'Monday, 19:00',
      'Wednesday, 18:30',
      'Thursday, 17:00',
    ],
  },

  {
    id: 'advanced-geometry',
    title: 'Advanced Geometry',
    category: 'Geometry',
    level: 'Intermediate',
    duration: '55 min',
    teacher: 'Geonix Teacher',

    description:
      'Build stronger geometry skills with more advanced shapes, angles, and calculations.',

    videoUrl:
      'https://www.youtube.com/watch?v=OmJ-4B-mS-Y',

    notes:
      'This lesson goes deeper into geometry calculations, angles, shapes, perimeter, and area.',

    availableTimes: [
      'Tuesday, 19:00',
      'Thursday, 18:30',
      'Saturday, 12:00',
    ],
  },
];


/* =========================
   COMPONENT
========================= */

function LessonDetails() {

  const { lessonId } = useParams();

  const lesson = lessons.find(
    (item) => item.id === lessonId
  );


  /* =========================
     LESSON NOT FOUND
  ========================= */

  if (!lesson) {

    return (
      <div className="lesson-not-found">

        <h1>
          Lesson Not Found
        </h1>

        <p>
          The lesson you are looking for
          does not exist.
        </p>

        <Link to="/video-lessons">
          ← Back to Video Lessons
        </Link>

      </div>
    );
  }


  return (
    <div className="lesson-details-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="lesson-details-header">

        <div className="lesson-details-logo">

          <Link to="/">
            <span className="logo-icon">
              G
            </span>

            <span className="logo-text">
              GEONIX
            </span>
          </Link>

        </div>

        <nav>

          <Link to="/">
            Home
          </Link>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/practice">
            Practice
          </Link>

          <Link
            to="/video-lessons"
            className="active"
          >
            Video Lessons
          </Link>

          <Link to="/profile">
            Profile
          </Link>

        </nav>

      </header>


      {/* =========================
          BACK
      ========================= */}

      <main className="lesson-details-content">

        <Link
          to="/video-lessons"
          className="back-to-lessons"
        >
          ← Back to Video Lessons
        </Link>


        {/* =========================
            LESSON HEADER
        ========================= */}

        <section className="lesson-details-intro">

          <div>

            <span className="details-category">
              {lesson.category}
            </span>

            <h1>
              {lesson.title}
            </h1>

            <p>
              {lesson.description}
            </p>

            <div className="details-meta">

              <span>
                ⏱ {lesson.duration}
              </span>

              <span>
                👨‍🏫 {lesson.teacher}
              </span>

              <span>
                📚 {lesson.level}
              </span>

            </div>

          </div>

        </section>


        {/* =========================
            VIDEO
        ========================= */}

        <section className="lesson-video-section">

          <VideoLesson
            title={lesson.title}
            url={lesson.videoUrl}
            notes={lesson.notes}
            duration={lesson.duration}
          />

        </section>


        {/* =========================
            SCHEDULE
        ========================= */}

        <section className="schedule-section">

          <div className="schedule-heading">

            <div>

              <span className="schedule-label">
                SCHEDULE
              </span>

              <h2>
                Choose Your Lesson Time
              </h2>

              <p>
                Select a convenient time for
                your scheduled learning session.
              </p>

            </div>

          </div>


          <div className="available-times">

            {lesson.availableTimes.map(
              (time, index) => (

                <div
                  className="time-card"
                  key={index}
                >

                  <div className="time-icon">
                    📅
                  </div>

                  <div className="time-information">

                    <strong>
                      {time}
                    </strong>

                    <span>
                      Available
                    </span>

                  </div>

                  <button
                    className="book-time-button"
                    onClick={() =>
                      alert(
                        `You selected ${time}. Payment will be added in the next phase.`
                      )
                    }
                  >
                    Select
                  </button>

                </div>

              )
            )}

          </div>


          {/* =========================
              PAYMENT NOTICE
          ========================= */}

          <div className="payment-preview">

            <div className="payment-icon">
              💳
            </div>

            <div>

              <h3>
                Secure Payment
              </h3>

              <p>
                After selecting your lesson time,
                you will continue to secure payment
                and confirm your booking.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default LessonDetails;
