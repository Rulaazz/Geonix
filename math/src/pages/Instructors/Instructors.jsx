import { API_BASE_URL as API_URL } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import './Instructors.css';


function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // =========================
  // LOAD INSTRUCTORS
  // =========================

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please log in to view instructors.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/instructors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInstructors(response.data.instructors || []);
      } catch (err) {
        console.error('LOAD INSTRUCTORS ERROR:', err);

        setError(
          err.response?.data?.message ||
            'Could not load instructors.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  // =========================
  // SUBJECTS
  // =========================

  const subjects = [
    'All',
    ...Array.from(
      new Set(
        instructors.flatMap(
          (instructor) => instructor.subjects || []
        )
      )
    ),
  ];

  // =========================
  // FILTER INSTRUCTORS
  // =========================

  const filteredInstructors = instructors.filter(
    (instructor) => {
      const name = instructor.user?.name || '';
      const bio = instructor.bio || '';
      const instructorSubjects =
        instructor.subjects || [];

      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        name
          .toLowerCase()
          .includes(searchValue) ||
        bio
          .toLowerCase()
          .includes(searchValue) ||
        instructorSubjects.some((subject) =>
          subject
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesSubject =
        selectedSubject === 'All' ||
        instructorSubjects.includes(
          selectedSubject
        );

      return matchesSearch && matchesSubject;
    }
  );

  // =========================
  // FORMAT EXPERIENCE
  // =========================

  const formatExperience = (experience) => {
    const years = Number(experience) || 0;

    if (years === 0) {
      return 'New instructor';
    }

    if (years === 1) {
      return '1 year experience';
    }

    return `${years} years experience`;
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="instructors-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="instructors-hero">

        <div className="instructors-hero-content">

          <span className="instructors-eyebrow">
            LIVE MATH LEARNING
          </span>

          <h1>
            Find Your Math Instructor
          </h1>

          <p>
            Learn mathematics with an instructor
            who matches your goals, level, and
            learning needs.
          </p>

        </div>

      </section>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="instructors-main">

        {/* =========================
            SEARCH & FILTERS
        ========================= */}

        <section className="instructors-controls">

          <div className="search-box">

            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Search instructors, subjects..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          <div className="subject-filters">

            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                className={
                  selectedSubject === subject
                    ? 'subject-filter active'
                    : 'subject-filter'
                }
                onClick={() =>
                  setSelectedSubject(subject)
                }
              >
                {subject}
              </button>
            ))}

          </div>

        </section>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="instructors-state">

            <div className="loading-spinner"></div>

            <h2>
              Finding instructors...
            </h2>

            <p>
              Please wait while we load the
              available math instructors.
            </p>

          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (
          <div className="instructors-state error-state">

            <div className="state-icon">
              ⚠️
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="retry-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        )}

        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          !error &&
          instructors.length === 0 && (
            <div className="instructors-state">

              <div className="state-icon">
                👩‍🏫
              </div>

              <h2>
                No instructors yet
              </h2>

              <p>
                Instructor profiles will appear
                here when they become available.
              </p>

            </div>
          )}

        {/* =========================
            NO FILTER RESULTS
        ========================= */}

        {!loading &&
          !error &&
          instructors.length > 0 &&
          filteredInstructors.length === 0 && (
            <div className="instructors-state">

              <div className="state-icon">
                🔍
              </div>

              <h2>
                No instructors found
              </h2>

              <p>
                Try another search or choose
                a different subject.
              </p>

              <button
                type="button"
                className="clear-filters-button"
                onClick={() => {
                  setSearch('');
                  setSelectedSubject('All');
                }}
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* =========================
            INSTRUCTOR GRID
        ========================= */}

        {!loading &&
          !error &&
          filteredInstructors.length > 0 && (
            <section className="instructors-results">

              <div className="results-header">

                <div>

                  <h2>
                    Available Instructors
                  </h2>

                  <p>
                    {filteredInstructors.length}{' '}
                    instructor
                    {filteredInstructors.length !== 1
                      ? 's'
                      : ''}{' '}
                    available
                  </p>

                </div>

              </div>

              <div className="instructors-grid">

                {filteredInstructors.map(
                  (instructor) => {
                    const name =
                      instructor.user?.name ||
                      'Math Instructor';

                    const avatar =
                      instructor.avatar || '';

                    const subjects =
                      instructor.subjects || [];

                    const grades =
                      instructor.grades || [];

                    return (
                      <article
                        key={instructor._id}
                        className="instructor-card"
                      >

                        {/* CARD TOP */}

                        <div className="instructor-card-top">

                          <div className="instructor-avatar">

                            {avatar ? (
                              <img
                                src={avatar}
                                alt={name}
                              />
                            ) : (
                              <span>
                                {name
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}

                          </div>

                          <div className="instructor-status">

                            <span className="status-dot"></span>

                            Available

                          </div>

                        </div>

                        {/* NAME */}

                        <div className="instructor-info">

                          <h3>
                            {name}
                          </h3>

                          <p className="instructor-role">
                            Mathematics Instructor
                          </p>

                          {/* BIO */}

                          <p className="instructor-bio">

                            {instructor.bio
                              ? instructor.bio
                              : 'Ready to help you improve your mathematics skills.'}

                          </p>

                          {/* EXPERIENCE */}

                          <div className="instructor-experience">

                            <span>
                              🎓
                            </span>

                            <span>
                              {formatExperience(
                                instructor.experience
                              )}
                            </span>

                          </div>

                          {/* SUBJECTS */}

                          {subjects.length > 0 && (
                            <div className="instructor-tags">

                              {subjects
                                .slice(0, 4)
                                .map((subject) => (
                                  <span
                                    key={subject}
                                    className="instructor-tag"
                                  >
                                    {subject}
                                  </span>
                                ))}

                              {subjects.length > 4 && (
                                <span className="instructor-tag more-tag">
                                  +{subjects.length - 4}
                                </span>
                              )}

                            </div>
                          )}

                          {/* GRADES */}

                          {grades.length > 0 && (
                            <div className="instructor-grades">

                              <span>
                                Levels:
                              </span>

                              <span>
                                {grades.join(', ')}
                              </span>

                            </div>
                          )}

                        </div>

                        {/* CARD FOOTER */}

                        <div className="instructor-card-footer">

                          <div className="instructor-price">

                            {Number(
                              instructor.hourlyRate
                            ) > 0 ? (
                              <>
                                <strong>
                                  $
                                  {
                                    instructor.hourlyRate
                                  }
                                </strong>

                                <span>
                                  / hour
                                </span>
                              </>
                            ) : (
                              <span>
                                Contact for pricing
                              </span>
                            )}

                          </div>

                          <Link
                            to={`/instructors/${instructor._id}`}
                            className="view-instructor-button"
                          >
                            View Profile

                            <span>
                              →
                            </span>

                          </Link>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            </section>
          )}

      </main>

    </div>
  );
}

export default Instructors;