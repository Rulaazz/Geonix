import { API_BASE_URL } from '../../config/api';
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';

import {
  Link,
  useParams,
} from 'react-router-dom';

import './InstructorDetails.css';


const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/* =====================================================
   DATE HELPERS
===================================================== */

const formatDateForInput = (date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );
};

const getNextDateForDay = (dayIndex) => {
  const date = new Date();

  for (let i = 0; i < 14; i += 1) {
    if (date.getDay() === dayIndex) {
      return formatDateForInput(date);
    }

    date.setDate(
      date.getDate() + 1
    );
  }

  return '';
};

/* =====================================================
   COMPONENT
===================================================== */

function InstructorDetails() {
  const { instructorId } = useParams();

  /* ===================================================
     STATE
  =================================================== */

  const [
    instructor,
    setInstructor,
  ] = useState(null);

  const [
    availability,
    setAvailability,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    selectedDate,
    setSelectedDate,
  ] = useState('');

  const [
    selectedStartTime,
    setSelectedStartTime,
  ] = useState('');

  const [
    selectedEndTime,
    setSelectedEndTime,
  ] = useState('');

  const [
    topic,
    setTopic,
  ] = useState('');

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    booking,
    setBooking,
  ] = useState(false);

  const [
    bookingMessage,
    setBookingMessage,
  ] = useState('');

  const [
    bookingError,
    setBookingError,
  ] = useState('');

  /* ===================================================
     LOAD INSTRUCTOR
  =================================================== */

  useEffect(() => {
    const loadInstructor = async () => {
      try {
        setLoading(true);
        setError('');

        const token =
          localStorage.getItem('token');

        if (!token) {
          setError(
            'Please log in to view instructor information.'
          );

          return;
        }

        const config = {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        };

        /* -----------------------------------------
           LOAD ALL INSTRUCTORS
        ----------------------------------------- */

        const response =
          await axios.get(
            `${API_BASE_URL}/api/instructors`,
            config
          );

        const instructors =
          response.data?.instructors || [];

        /* -----------------------------------------
           FIND BY INSTRUCTOR ID
        ----------------------------------------- */

        let foundInstructor =
          instructors.find(
            (item) =>
              String(item._id) ===
              String(instructorId)
          );

        /* -----------------------------------------
           FALLBACK TO USER ID
        ----------------------------------------- */

        if (!foundInstructor) {
          foundInstructor =
            instructors.find(
              (item) =>
                String(
                  item.user?._id
                ) ===
                String(instructorId)
            );
        }

        if (!foundInstructor) {
          setError(
            'Instructor not found.'
          );

          return;
        }

        setInstructor(
          foundInstructor
        );

        /* -----------------------------------------
           USER ID
        ----------------------------------------- */

        const userId =
          foundInstructor.user?._id;

        if (!userId) {
          setError(
            'This instructor profile is missing its user information.'
          );

          return;
        }

        /* -----------------------------------------
           LOAD AVAILABILITY
        ----------------------------------------- */

        const availabilityResponse =
          await axios.get(
            `${API_BASE_URL}/api/availability/instructor/${userId}`,
            config
          );

        setAvailability(
          availabilityResponse.data
            ?.availability || []
        );
      } catch (err) {
        console.error(
          'LOAD INSTRUCTOR ERROR:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Could not load instructor information.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadInstructor();
  }, [instructorId]);

  /* ===================================================
     AVAILABLE DAYS
  =================================================== */

  const availableDays = useMemo(() => {
    return [
      ...new Set(
        availability.map(
          (slot) =>
            slot.dayOfWeek
        )
      ),
    ];
  }, [availability]);

  /* ===================================================
     AVAILABLE SLOTS FOR SELECTED DATE
  =================================================== */

  const availableSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const date = new Date(
      `${selectedDate}T00:00:00`
    );

    const day = date.getDay();

    return availability.filter(
      (slot) =>
        slot.dayOfWeek === day
    );
  }, [
    selectedDate,
    availability,
  ]);

  /* ===================================================
     TODAY
  =================================================== */

  const today =
    formatDateForInput(
      new Date()
    );

  /* ===================================================
     DATE CHANGE
  =================================================== */

  const handleDateChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSelectedDate(value);

    setSelectedStartTime('');

    setSelectedEndTime('');

    setBookingMessage('');

    setBookingError('');
  };

  /* ===================================================
     SELECT TIME
  =================================================== */

  const handleSelectTime = (
    startTime,
    endTime
  ) => {
    setSelectedStartTime(
      startTime
    );

    setSelectedEndTime(
      endTime
    );

    setBookingMessage('');

    setBookingError('');

    setTimeout(() => {
      document
        .getElementById(
          'booking-form'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  };

  /* ===================================================
     WEEKLY SLOT CLICK
  =================================================== */

  const handleWeeklySlotClick = (
    dayIndex,
    startTime,
    endTime
  ) => {
    let dateToUse =
      selectedDate;

    if (
      !dateToUse ||
      new Date(
        `${dateToUse}T00:00:00`
      ).getDay() !== dayIndex
    ) {
      dateToUse =
        getNextDateForDay(
          dayIndex
        );

      setSelectedDate(
        dateToUse
      );
    }

    setSelectedStartTime(
      startTime
    );

    setSelectedEndTime(
      endTime
    );

    setBookingMessage('');

    setBookingError('');

    setTimeout(() => {
      document
        .getElementById(
          'booking-form'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  };

  /* ===================================================
     BOOK LESSON
  =================================================== */

  const handleBooking = async (
    event
  ) => {
    event.preventDefault();

    setBookingMessage('');

    setBookingError('');

    if (!selectedDate) {
      setBookingError(
        'Please select a date.'
      );

      return;
    }

    if (
      !selectedStartTime ||
      !selectedEndTime
    ) {
      setBookingError(
        'Please select an available time.'
      );

      return;
    }

    if (!topic.trim()) {
      setBookingError(
        'Please enter what you would like to learn.'
      );

      return;
    }

    try {
      setBooking(true);

      const token =
        localStorage.getItem('token');

      if (!token) {
        setBookingError(
          'Your session has expired. Please log in again.'
        );

        return;
      }

      const userId =
        instructor.user?._id;

      if (!userId) {
        setBookingError(
          'Instructor information is incomplete.'
        );

        return;
      }

      const response =
        await axios.post(
          `${API_BASE_URL}/api/bookings`,
          {
            instructorId:
              userId,

            date:
              selectedDate,

            startTime:
              selectedStartTime,

            endTime:
              selectedEndTime,

            topic:
              topic.trim(),

            notes:
              notes.trim(),
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setBookingMessage(
        response.data.message ||
        'Lesson booked successfully!'
      );

      setTopic('');

      setNotes('');

      setSelectedStartTime('');

      setSelectedEndTime('');
    } catch (err) {
      console.error(
        'BOOKING ERROR:',
        err
      );

      setBookingError(
        err.response?.data?.message ||
        'Could not create the booking.'
      );
    } finally {
      setBooking(false);
    }
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="instructor-details-page">
        <div className="details-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading instructor...
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (
    error ||
    !instructor
  ) {
    return (
      <div className="instructor-details-page">
        <main className="details-error-page">
          <div className="details-error-card">

            <div className="error-icon">
              !
            </div>

            <h1>
              Instructor Not Found
            </h1>

            <p>
              {error ||
                'The instructor you are looking for does not exist.'}
            </p>

            <Link
              to="/instructors"
              className="back-button"
            >
              ← Back to Instructors
            </Link>

          </div>
        </main>
      </div>
    );
  }

  /* ===================================================
     MAIN PAGE
  =================================================== */

  return (
    <div className="instructor-details-page">

      <main className="instructor-details-container">

        {/* BREADCRUMB */}

        <div className="details-breadcrumb">

          <Link to="/instructors">
            Instructors
          </Link>

          <span>/</span>

          <span>
            {instructor.user?.name ||
              'Instructor'}
          </span>

        </div>

        {/* PROFILE HEADER */}

        <section className="instructor-profile-card">

          <div className="profile-main">

            <div className="profile-avatar-large">

              {instructor.avatar ? (
                <img
                  src={
                    instructor.avatar
                  }
                  alt={
                    instructor.user
                      ?.name ||
                    'Instructor'
                  }
                />
              ) : (
                <span>
                  {(
                    instructor.user
                      ?.name ||
                    'I'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}

            </div>

            <div className="profile-information">

              <div className="profile-status">
                <span className="status-dot"></span>
                Available for lessons
              </div>

              <h1>
                {instructor.user?.name ||
                  'Math Instructor'}
              </h1>

              <p className="profile-bio">
                {instructor.bio ||
                  'Experienced mathematics instructor ready to help you improve your skills.'}
              </p>

              <div className="profile-subjects">

                {instructor.subjects?.map(
                  (subject) => (
                    <span
                      key={subject}
                      className="subject-tag"
                    >
                      {subject}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>

          <div className="profile-price">

            <span>
              Starting from
            </span>

            <strong>
              ₪
              {instructor.hourlyRate ||
                0}
            </strong>

            <small>
              / hour
            </small>

          </div>

        </section>

        {/* STATS */}

        <section className="profile-stats">

          <div className="stat-item">
            <strong>
              {instructor.experience ||
                0}
            </strong>

            <span>
              Years Experience
            </span>
          </div>

          <div className="stat-item">
            <strong>
              {instructor.subjects
                ?.length || 0}
            </strong>

            <span>
              Subjects
            </span>
          </div>

          <div className="stat-item">
            <strong>
              {instructor.grades
                ?.length || 0}
            </strong>

            <span>
              Grade Levels
            </span>
          </div>

          <div className="stat-item">
            <strong>
              Online
            </strong>

            <span>
              Learning
            </span>
          </div>

        </section>

        {/* CONTENT GRID */}

        <div className="details-content-grid">

          <div className="details-main-column">

            {/* ABOUT */}

            <section className="details-section">

              <div className="section-heading">

                <span className="section-icon">
                  👨‍🏫
                </span>

                <div>
                  <h2>
                    About the Instructor
                  </h2>

                  <p>
                    Learn more about your
                    future math instructor.
                  </p>
                </div>

              </div>

              <p className="about-text">
                {instructor.bio ||
                  'This instructor has not added a detailed biography yet.'}
              </p>

            </section>

            {/* SUBJECTS */}

            <section className="details-section">

              <div className="section-heading">

                <span className="section-icon">
                  📚
                </span>

                <div>
                  <h2>
                    What Can You Learn?
                  </h2>

                  <p>
                    Mathematics topics
                    available with this
                    instructor.
                  </p>
                </div>

              </div>

              <div className="subjects-grid">

                {instructor.subjects?.length >
                0 ? (
                  instructor.subjects.map(
                    (subject) => (
                      <div
                        className="subject-card"
                        key={subject}
                      >
                        <span>
                          ✓
                        </span>

                        <strong>
                          {subject}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <p>
                    Mathematics
                  </p>
                )}

              </div>

            </section>

            {/* GRADES */}

            <section className="details-section">

              <div className="section-heading">

                <span className="section-icon">
                  🎓
                </span>

                <div>
                  <h2>
                    Grade Levels
                  </h2>

                  <p>
                    Students this instructor
                    can teach.
                  </p>
                </div>

              </div>

              <div className="grades-list">

                {instructor.grades?.length >
                0 ? (
                  instructor.grades.map(
                    (grade) => (
                      <span
                        key={grade}
                        className="grade-tag"
                      >
                        {grade}
                      </span>
                    )
                  )
                ) : (
                  <span className="grade-tag">
                    All levels
                  </span>
                )}

              </div>

            </section>

            {/* WEEKLY AVAILABILITY */}

            <section className="details-section">

              <div className="section-heading">

                <span className="section-icon">
                  🗓️
                </span>

                <div>
                  <h2>
                    Weekly Availability
                  </h2>

                  <p>
                    Choose a day and time
                    that works for you.
                  </p>
                </div>

              </div>

              {availability.length ===
              0 ? (

                <div className="no-availability">

                  <span>
                    🕐
                  </span>

                  <h3>
                    No availability added yet
                  </h3>

                  <p>
                    This instructor has not
                    published any available
                    lesson times yet.
                  </p>

                </div>

              ) : (

                <div className="weekly-availability">

                  {dayNames.map(
                    (
                      day,
                      dayIndex
                    ) => {

                      const slots =
                        availability.filter(
                          (slot) =>
                            slot.dayOfWeek ===
                            dayIndex
                        );

                      if (
                        slots.length ===
                        0
                      ) {
                        return null;
                      }

                      return (
                        <div
                          className="availability-day"
                          key={day}
                        >

                          <div className="availability-day-name">
                            {day}
                          </div>

                          <div className="availability-slots">

                            {slots.map(
                              (slot) => {

                                const isSelected =
                                  selectedDate &&
                                  new Date(
                                    `${selectedDate}T00:00:00`
                                  ).getDay() ===
                                    dayIndex &&
                                  selectedStartTime ===
                                    slot.startTime &&
                                  selectedEndTime ===
                                    slot.endTime;

                                return (
                                  <button
                                    type="button"
                                    key={
                                      slot._id
                                    }
                                    className={
                                      isSelected
                                        ? 'time-slot selected'
                                        : 'time-slot'
                                    }
                                    onClick={() =>
                                      handleWeeklySlotClick(
                                        dayIndex,
                                        slot.startTime,
                                        slot.endTime
                                      )
                                    }
                                  >
                                    <span>
                                      {
                                        slot.startTime
                                      }
                                    </span>

                                    <small>
                                      -
                                      {
                                        slot.endTime
                                      }
                                    </small>
                                  </button>
                                );
                              }
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* BOOKING FORM */}

            <section
              className="details-section booking-section"
              id="booking-form"
            >

              <div className="section-heading">

                <span className="section-icon">
                  📅
                </span>

                <div>
                  <h2>
                    Book a Math Lesson
                  </h2>

                  <p>
                    Schedule your live online
                    lesson.
                  </p>
                </div>

              </div>

              {bookingMessage && (
                <div className="booking-success">

                  <span>
                    ✓
                  </span>

                  {bookingMessage}

                </div>
              )}

              {bookingError && (
                <div className="booking-error">

                  <span>
                    !
                  </span>

                  {bookingError}

                </div>
              )}

              <form
                onSubmit={
                  handleBooking
                }
                className="booking-form"
              >

                {/* DATE */}

                <div className="form-group">

                  <label htmlFor="lesson-date">
                    Choose a date
                  </label>

                  <input
                    id="lesson-date"
                    type="date"
                    min={today}
                    value={
                      selectedDate
                    }
                    onChange={
                      handleDateChange
                    }
                  />

                  {selectedDate && (
                    <small className="selected-date-text">
                      {formatDisplayDate(
                        selectedDate
                      )}
                    </small>
                  )}

                </div>

                {/* TIME */}

                <div className="form-group">

                  <label>
                    Choose an available time
                  </label>

                  {!selectedDate ? (

                    <div className="form-help">
                      Select a date first.
                    </div>

                  ) : availableSlots.length ===
                    0 ? (

                    <div className="form-help form-help-warning">
                      No availability on this
                      day. Please choose
                      another date.
                    </div>

                  ) : (

                    <div className="booking-time-grid">

                      {availableSlots.map(
                        (slot) => (

                          <button
                            type="button"
                            key={
                              slot._id
                            }
                            className={
                              selectedStartTime ===
                                slot.startTime &&
                              selectedEndTime ===
                                slot.endTime
                                ? 'booking-time-button selected'
                                : 'booking-time-button'
                            }
                            onClick={() =>
                              handleSelectTime(
                                slot.startTime,
                                slot.endTime
                              )
                            }
                          >

                            <strong>
                              {
                                slot.startTime
                              }
                            </strong>

                            <span>
                              -
                              {
                                slot.endTime
                              }
                            </span>

                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>

                {/* TOPIC */}

                <div className="form-group">

                  <label htmlFor="lesson-topic">
                    What would you like to learn?
                  </label>

                  <input
                    id="lesson-topic"
                    type="text"
                    placeholder="Example: Algebra, fractions, equations..."
                    value={topic}
                    onChange={(event) =>
                      setTopic(
                        event.target.value
                      )
                    }
                    maxLength={120}
                  />

                  <small className="field-hint">
                    Tell your instructor
                    what you want to focus
                    on.
                  </small>

                </div>

                {/* NOTES */}

                <div className="form-group">

                  <label htmlFor="lesson-notes">
                    Notes for the instructor
                    <span>
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="lesson-notes"
                    rows="5"
                    placeholder="Tell the instructor what you need help with..."
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    maxLength={500}
                  />

                  <small className="field-hint">
                    {notes.length}/500
                  </small>

                </div>

                {/* SUMMARY */}

                {selectedDate &&
                  selectedStartTime && (

                    <div className="booking-summary">

                      <div>
                        <span>
                          Lesson
                        </span>

                        <strong>
                          Live Math Lesson
                        </strong>
                      </div>

                      <div>
                        <span>
                          Date
                        </span>

                        <strong>
                          {formatDisplayDate(
                            selectedDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Time
                        </span>

                        <strong>
                          {
                            selectedStartTime
                          }{' '}
                          -{' '}
                          {
                            selectedEndTime
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Instructor
                        </span>

                        <strong>
                          {instructor.user
                            ?.name ||
                            'Instructor'}
                        </strong>
                      </div>

                    </div>

                  )}

                {/* BOOK */}

                <button
                  type="submit"
                  className="submit-booking-button"
                  disabled={
                    booking ||
                    !selectedDate ||
                    !selectedStartTime ||
                    !topic.trim()
                  }
                >

                  {booking ? (
                    <>
                      <span className="button-spinner"></span>
                      Booking...
                    </>
                  ) : (
                    <>
                      Book Lesson
                      <span>
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>

            </section>

          </div>

          {/* SIDEBAR */}

          <aside className="details-sidebar">

            <div className="booking-card">

              <div className="booking-card-icon">
                🎥
              </div>

              <h2>
                Learn Live Online
              </h2>

              <p>
                Get personalized help from
                your instructor through a
                live online math lesson.
              </p>

              <div className="booking-features">

                <div>
                  <span>
                    ✓
                  </span>
                  Live video lesson
                </div>

                <div>
                  <span>
                    ✓
                  </span>
                  Personalized instruction
                </div>

                <div>
                  <span>
                    ✓
                  </span>
                  Choose your schedule
                </div>

                <div>
                  <span>
                    ✓
                  </span>
                  Math-focused learning
                </div>

              </div>

              <button
                type="button"
                className="sidebar-book-button"
                onClick={() =>
                  document
                    .getElementById(
                      'booking-form'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                      block: 'start',
                    })
                }
              >
                Book a Lesson

                <span>
                  →
                </span>
              </button>

            </div>

            {/* QUICK INFO */}

            <div className="quick-info-card">

              <h3>
                Lesson Information
              </h3>

              <div className="quick-info-item">

                <span>
                  ⏱️
                </span>

                <div>
                  <strong>
                    Live session
                  </strong>

                  <small>
                    Scheduled with your
                    instructor
                  </small>
                </div>

              </div>

              <div className="quick-info-item">

                <span>
                  💻
                </span>

                <div>
                  <strong>
                    Online
                  </strong>

                  <small>
                    Join from your device
                  </small>
                </div>

              </div>

              <div className="quick-info-item">

                <span>
                  📚
                </span>

                <div>
                  <strong>
                    Mathematics
                  </strong>

                  <small>
                    Personalized learning
                  </small>
                </div>

              </div>

            </div>

            {/* AVAILABLE DAYS */}

            {availableDays.length > 0 && (
              <div className="quick-info-card">

                <h3>
                  Available Days
                </h3>

                <div className="available-days-list">

                  {[...availableDays]
                    .sort(
                      (a, b) =>
                        a - b
                    )
                    .map(
                      (
                        dayIndex
                      ) => (

                        <div
                          key={
                            dayIndex
                          }
                          className="available-day-item"
                        >

                          <span>
                            ✓
                          </span>

                          {
                            dayNames[
                              dayIndex
                            ]
                          }

                        </div>

                      )
                    )}

                </div>

              </div>
            )}

          </aside>

        </div>

      </main>

    </div>
  );
}

export default InstructorDetails;