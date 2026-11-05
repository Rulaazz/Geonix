import { API_BASE_URL } from '../../config/api';
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import axios from 'axios';

import './VideoLessons.css';

/* =========================
   LESSON DATA
========================= */

export const lessons = [
  {
    id: 'algebra-basics',
    title: 'Algebra Basics',
    category: 'Algebra',
    level: 'Beginner',
    duration: '12 min',
    description:
      'Learn the foundations of algebra, including variables, expressions, and simple equations.',
    topics: [
      'Understand variables',
      'Build algebraic expressions',
      'Solve simple equations',
    ],
    videoUrl:
      'https://www.youtube.com/embed/NybHckSEQBI',
  },

  {
    id: 'fractions-basics',
    title: 'Fractions Basics',
    category: 'Fractions',
    level: 'Beginner',
    duration: '10 min',
    description:
      'Learn how fractions work and how to compare, simplify, add, and subtract them.',
    topics: [
      'Understand fractions',
      'Simplify fractions',
      'Add and subtract fractions',
    ],
    videoUrl:
      'https://www.youtube.com/embed/5juto2ze8Lg',
  },

  {
    id: 'geometry-basics',
    title: 'Geometry Basics',
    category: 'Geometry',
    level: 'Beginner',
    duration: '14 min',
    description:
      'Explore basic geometric shapes, angles, and important geometry vocabulary.',
    topics: [
      'Identify common shapes',
      'Understand angles',
      'Learn geometry terminology',
    ],
    videoUrl:
      'https://www.youtube.com/embed/SgH9i3q5VnA',
  },

  {
    id: 'multiplication-division',
    title: 'Multiplication & Division',
    category: 'Multiplication',
    level: 'Beginner',
    duration: '11 min',
    description:
      'Strengthen multiplication and division skills with clear examples and strategies.',
    topics: [
      'Review multiplication',
      'Understand division',
      'Solve multiplication and division problems',
    ],
    videoUrl:
      'https://www.youtube.com/embed/2QWg2V5f4GQ',
  },

  {
    id: 'linear-equations',
    title: 'Linear Equations',
    category: 'Algebra',
    level: 'Intermediate',
    duration: '16 min',
    description:
      'Learn how to solve linear equations step by step and understand the reasoning behind each step.',
    topics: [
      'Understand linear equations',
      'Use inverse operations',
      'Solve equations step by step',
    ],
    videoUrl:
      'https://www.youtube.com/embed/qeH9Xv_7k5U',
  },

  {
    id: 'advanced-geometry',
    title: 'Advanced Geometry',
    category: 'Geometry',
    level: 'Intermediate',
    duration: '18 min',
    description:
      'Go beyond the basics with more challenging geometry concepts and problem-solving techniques.',
    topics: [
      'Work with geometric relationships',
      'Solve multi-step geometry problems',
      'Apply geometry formulas',
    ],
    videoUrl:
      'https://www.youtube.com/embed/7G8N0lKxJxQ',
  },
];

/* =========================
   CATEGORIES
========================= */

const categories = [
  'All',
  'Algebra',
  'Fractions',
  'Geometry',
  'Multiplication',
];

/* =========================
   VIDEO LESSONS
========================= */

const VideoLessons = () => {
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [completedLessons, setCompletedLessons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     LOAD PROGRESS
  ========================= */

  useEffect(() => {
    const loadProgress = async () => {
      const token =
        localStorage.getItem('token');

      /* =========================
         LOCAL STORAGE FALLBACK
      ========================= */

      try {
        const saved =
          JSON.parse(
            localStorage.getItem(
              'geonixCompletedLessons'
            ) || '[]'
          );

        if (Array.isArray(saved)) {
          setCompletedLessons(saved);
        }
      } catch (error) {
        console.error(
          'Could not read local lesson progress:',
          error
        );
      }

      if (!token) {
        setLoading(false);
        return;
      }

      /* =========================
         BACKEND
      ========================= */

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/lesson-progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const backendProgress =
          response.data?.progress || [];

        const completed =
          backendProgress
            .filter(
              (item) =>
                item.completed === true
            )
            .map(
              (item) =>
                item.lessonId
            );

        setCompletedLessons(completed);

        /* =========================
           SYNC LOCAL STORAGE
        ========================= */

        localStorage.setItem(
          'geonixCompletedLessons',
          JSON.stringify(completed)
        );
      } catch (error) {
        console.error(
          'Could not load video lesson progress:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  /* =========================
     FILTER LESSONS
  ========================= */

  const filteredLessons = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return lessons.filter((lesson) => {
      const categoryMatch =
        selectedCategory === 'All' ||
        lesson.category === selectedCategory;

      const searchMatch =
        !search ||
        lesson.title
          .toLowerCase()
          .includes(search) ||
        lesson.category
          .toLowerCase()
          .includes(search) ||
        lesson.description
          .toLowerCase()
          .includes(search);

      return (
        categoryMatch &&
        searchMatch
      );
    });
  }, [
    selectedCategory,
    searchTerm,
  ]);

  /* =========================
     STATISTICS
  ========================= */

  const completedCount =
    completedLessons.length;

  const totalLessons =
    lessons.length;

  const progressPercentage =
    totalLessons > 0
      ? Math.round(
          (completedCount /
            totalLessons) *
            100
        )
      : 0;

  /* =========================
     NEXT LESSON
  ========================= */

  const nextLesson =
    lessons.find(
      (lesson) =>
        !completedLessons.includes(
          lesson.id
        )
    );

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="video-lessons-page">

      <main className="video-lessons-main">

        {/* =========================
            HERO
        ========================= */}

        <section className="video-lessons-hero">

          <div className="video-lessons-hero-content">

            <span className="video-lessons-eyebrow">
              LEARN WITH VIDEO
            </span>

            <h1>
              Math Video Lessons
            </h1>

            <p>
              Learn important math concepts with
              clear, step-by-step video lessons.
              Watch, learn, and practice at your
              own pace.
            </p>

          </div>

          <div className="video-lessons-hero-icon">
            🎥
          </div>

        </section>

        {/* =========================
            PROGRESS
        ========================= */}

        <section className="catalog-progress-card">

          <div className="catalog-progress-main">

            <div className="catalog-progress-icon">
              📚
            </div>

            <div>

              <span>
                YOUR LEARNING PROGRESS
              </span>

              <h2>
                {loading
                  ? 'Loading...'
                  : `${completedCount} of ${totalLessons} lessons completed`}
              </h2>

            </div>

          </div>

          <div className="catalog-progress-right">

            <strong>
              {loading
                ? '...'
                : `${progressPercentage}%`}
            </strong>

            <div className="catalog-progress-bar">

              <div
                className="catalog-progress-fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

          </div>

        </section>

        {/* =========================
            CONTINUE LEARNING
        ========================= */}

        {nextLesson && !loading && (
          <section className="continue-learning-card">

            <div className="continue-learning-icon">
              ▶
            </div>

            <div className="continue-learning-content">

              <span>
                CONTINUE LEARNING
              </span>

              <h2>
                {nextLesson.title}
              </h2>

              <p>
                {nextLesson.description}
              </p>

            </div>

            <Link
              to={`/video-lessons/${nextLesson.id}`}
              className="continue-learning-button"
            >
              Continue →
            </Link>

          </section>
        )}

        {/* =========================
            FILTERS
        ========================= */}

        <section className="lesson-controls">

          <div className="lesson-search">

            <span>
              🔎
            </span>

            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

          <div className="lesson-categories">

            {categories.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                  className={
                    selectedCategory === category
                      ? 'selected'
                      : ''
                  }
                >
                  {category}
                </button>
              )
            )}

          </div>

        </section>

        {/* =========================
            LESSON GRID
        ========================= */}

        <section className="lesson-catalog">

          <div className="lesson-catalog-header">

            <div>

              <span>
                LESSON LIBRARY
              </span>

              <h2>
                Explore Lessons
              </h2>

            </div>

            <span className="lesson-count">
              {filteredLessons.length}{' '}
              lessons
            </span>

          </div>

          {filteredLessons.length === 0 ? (

            <div className="no-lessons">

              <div>
                🔎
              </div>

              <h3>
                No lessons found
              </h3>

              <p>
                Try another search or category.
              </p>

            </div>

          ) : (

            <div className="lesson-grid">

              {filteredLessons.map(
                (lesson, index) => {

                  const isCompleted =
                    completedLessons.includes(
                      lesson.id
                    );

                  return (
                    <article
                      className={
                        isCompleted
                          ? 'lesson-card completed'
                          : 'lesson-card'
                      }
                      key={lesson.id}
                    >

                      {/* CARD TOP */}

                      <div className="lesson-card-top">

                        <div className="lesson-card-number">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </div>

                        <div className="lesson-card-category">
                          {lesson.category}
                        </div>

                        {isCompleted && (
                          <div className="lesson-completed-badge">
                            ✓ Completed
                          </div>
                        )}

                      </div>

                      {/* CARD BODY */}

                      <div className="lesson-card-body">

                        <h3>
                          {lesson.title}
                        </h3>

                        <p>
                          {lesson.description}
                        </p>

                        <div className="lesson-card-meta">

                          <span>
                            ⏱️ {lesson.duration}
                          </span>

                          <span>
                            🎓 {lesson.level}
                          </span>

                        </div>

                        {/* TOPICS */}

                        <div className="lesson-card-topics">

                          {lesson.topics
                            .slice(0, 2)
                            .map(
                              (
                                topic,
                                topicIndex
                              ) => (
                                <span
                                  key={topicIndex}
                                >
                                  ✓ {topic}
                                </span>
                              )
                            )}

                        </div>

                      </div>

                      {/* CARD FOOTER */}

                      <div className="lesson-card-footer">

                        <Link
                          to={`/video-lessons/${lesson.id}`}
                          className={
                            isCompleted
                              ? 'lesson-card-button review'
                              : 'lesson-card-button'
                          }
                        >
                          {isCompleted
                            ? 'Review Lesson →'
                            : 'Start Lesson →'}
                        </Link>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default VideoLessons;
