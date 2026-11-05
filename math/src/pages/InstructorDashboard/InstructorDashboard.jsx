import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import { Link } from 'react-router-dom';

import './InstructorDashboard.css';

const API_URL = 'http://localhost:5001';

const days = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const emptyForm = {
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '10:00',
};

function InstructorDashboard() {
  /* =========================
     AVAILABILITY STATE
  ========================= */

  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(true);

  const [savingAvailability, setSavingAvailability] =
    useState(false);

  /* =========================
     BOOKING STATE
  ========================= */

  const [bookings, setBookings] = useState([]);

  const [bookingsLoading, setBookingsLoading] =
    useState(true);

  const [bookingActionId, setBookingActionId] =
    useState('');

  const [bookingError, setBookingError] =
    useState('');

  const [bookingSuccess, setBookingSuccess] =
    useState('');

  /* =========================
     GENERAL STATE
  ========================= */

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  /* =========================
     AUTH CONFIG
  ========================= */

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  /* =========================
     LOAD AVAILABILITY
  ========================= */

  const loadAvailability = useCallback(async () => {
    if (!token) {
      setAvailabilityLoading(false);
      return;
    }

    try {
      setAvailabilityLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/api/availability/me`,
        authConfig
      );

      setAvailability(
        response.data.availability || []
      );
    } catch (err) {
      console.error(
        'LOAD AVAILABILITY ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not load your availability.'
      );
    } finally {
      setAvailabilityLoading(false);
    }
  }, [token, authConfig]);

  /* =========================
     LOAD BOOKINGS
  ========================= */

  const loadBookings = useCallback(async () => {
    if (!token) {
      setBookingsLoading(false);
      return;
    }

    try {
      setBookingsLoading(true);
      setBookingError('');

      const response = await axios.get(
        `${API_URL}/api/bookings/my`,
        authConfig
      );

      console.log(
        'INSTRUCTOR DASHBOARD BOOKINGS:',
        response.data.bookings
      );

      setBookings(
        response.data.bookings || []
      );
    } catch (err) {
      console.error(
        'LOAD BOOKINGS ERROR:',
        err
      );

      setBookingError(
        err.response?.data?.message ||
          'Could not load your bookings.'
      );
    } finally {
      setBookingsLoading(false);
    }
  }, [token, authConfig]);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (!token) {
      setAvailabilityLoading(false);
      setBookingsLoading(false);

      setError('Please log in first.');

      return;
    }

    loadAvailability();
    loadBookings();
  }, [token, loadAvailability, loadBookings]);

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'dayOfWeek'
          ? Number(value)
          : value,
    }));

    setError('');
    setSuccess('');
  };

  /* =========================
     ADD AVAILABILITY
  ========================= */

  const handleAddAvailability = async (event) => {
    event.preventDefault();

    setSavingAvailability(true);

    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/api/availability`,
        {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        },
        authConfig
      );

      setAvailability((previous) => [
        ...previous,
        response.data.availability,
      ]);

      setSuccess(
        'Availability added successfully!'
      );

      setForm(emptyForm);

      await loadAvailability();
    } catch (err) {
      console.error(
        'ADD AVAILABILITY ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not add this availability.'
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  /* =========================
     TOGGLE AVAILABILITY
  ========================= */

  const handleToggle = async (slot) => {
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_URL}/api/availability/${slot._id}`,
        {
          isActive: !slot.isActive,
        },
        authConfig
      );

      setAvailability((previous) =>
        previous.map((item) =>
          item._id === slot._id
            ? response.data.availability
            : item
        )
      );

      setSuccess(
        response.data.message ||
          'Availability updated successfully.'
      );
    } catch (err) {
      console.error(
        'TOGGLE AVAILABILITY ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not update availability.'
      );
    }
  };

  /* =========================
     DELETE AVAILABILITY
  ========================= */

  const handleDelete = async (slotId) => {
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete(
        `${API_URL}/api/availability/${slotId}`,
        authConfig
      );

      setAvailability((previous) =>
        previous.filter(
          (item) => item._id !== slotId
        )
      );

      setSuccess(
        response.data.message ||
          'Availability removed successfully.'
      );
    } catch (err) {
      console.error(
        'DELETE AVAILABILITY ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not remove availability.'
      );
    }
  };

  /* =========================
     CONFIRM BOOKING
  ========================= */

  const handleConfirmBooking = async (bookingId) => {
    setBookingActionId(bookingId);

    setBookingError('');
    setBookingSuccess('');

    console.log(
      'CONFIRMING BOOKING:',
      bookingId
    );

    try {
      const response = await axios.put(
        `${API_URL}/api/bookings/${bookingId}/confirm`,
        {},
        authConfig
      );

      console.log(
        'CONFIRM RESPONSE:',
        response.data
      );

      setBookingSuccess(
        response.data.message ||
          'Booking confirmed successfully.'
      );

      await loadBookings();
    } catch (err) {
      console.error(
        'CONFIRM BOOKING ERROR:',
        err
      );

      setBookingError(
        err.response?.data?.message ||
          'Could not confirm this booking.'
      );
    } finally {
      setBookingActionId('');
    }
  };

  /* =========================
     CANCEL BOOKING
  ========================= */

  const handleCancelBooking = async (bookingId) => {
    setBookingActionId(bookingId);

    setBookingError('');
    setBookingSuccess('');

    try {
      const response = await axios.put(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {},
        authConfig
      );

      setBookingSuccess(
        response.data.message ||
          'Booking cancelled successfully.'
      );

      await loadBookings();
    } catch (err) {
      console.error(
        'CANCEL BOOKING ERROR:',
        err
      );

      setBookingError(
        err.response?.data?.message ||
          'Could not cancel this booking.'
      );
    } finally {
      setBookingActionId('');
    }
  };

  /* =========================
     COMPLETE BOOKING
  ========================= */

  const handleCompleteBooking = async (bookingId) => {
    setBookingActionId(bookingId);

    setBookingError('');
    setBookingSuccess('');

    try {
      const response = await axios.put(
        `${API_URL}/api/bookings/${bookingId}/complete`,
        {},
        authConfig
      );

      setBookingSuccess(
        response.data.message ||
          'Lesson marked as completed.'
      );

      await loadBookings();
    } catch (err) {
      console.error(
        'COMPLETE BOOKING ERROR:',
        err
      );

      setBookingError(
        err.response?.data?.message ||
          'Could not complete this lesson.'
      );
    } finally {
      setBookingActionId('');
    }
  };

  /* =========================
     DAY NAME
  ========================= */

  const getDayName = (dayNumber) => {
    const day = days.find(
      (item) => item.value === dayNumber
    );

    return day
      ? day.label
      : 'Unknown';
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatBookingDate = (date) => {
    if (!date) {
      return 'Date unavailable';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  const formatShortDate = (date) => {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  /* =========================
     GROUP AVAILABILITY
  ========================= */

  const groupedAvailability =
    days.map((day) => ({
      ...day,

      slots: availability
        .filter(
          (slot) =>
            slot.dayOfWeek === day.value
        )
        .sort((a, b) =>
          a.startTime.localeCompare(
            b.startTime
          )
        ),
    }));

  /* =========================
     BOOKING STATS
  ========================= */

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.status === 'pending'
    );

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.status === 'confirmed'
    );

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status === 'completed'
    );

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.status === 'cancelled'
    );

  /* =========================
     UPCOMING BOOKINGS
  ========================= */

  const upcomingBookings =
    bookings
      .filter(
        (booking) =>
          booking.status === 'confirmed' ||
          booking.status === 'pending'
      )
      .filter((booking) => {
        if (!booking.date) {
          return false;
        }

        return (
          new Date(booking.date) >=
          new Date(
            new Date().setHours(
              0,
              0,
              0,
              0
            )
          )
        );
      })
      .sort(
        (a, b) =>
          new Date(a.date) -
            new Date(b.date) ||
          a.startTime.localeCompare(
            b.startTime
          )
      );

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="instructor-dashboard">

      <main className="instructor-main">

        {/* WELCOME */}

        <section className="instructor-welcome">

          <div>
            <span className="welcome-label">
              INSTRUCTOR AREA
            </span>

            <h1>
              Instructor Dashboard
            </h1>

            <p>
              Manage your teaching schedule,
              respond to student requests,
              and prepare for your live math
              lessons.
            </p>
          </div>

          <div className="welcome-icon">
            👩‍🏫
          </div>

        </section>

        {/* STATS */}

        <section className="instructor-stats">

          <div className="instructor-stat-card">
            <div className="stat-icon">
              📥
            </div>

            <div>
              <span>
                Pending Requests
              </span>

              <strong>
                {pendingBookings.length}
              </strong>
            </div>
          </div>

          <div className="instructor-stat-card">
            <div className="stat-icon">
              📅
            </div>

            <div>
              <span>
                Confirmed Lessons
              </span>

              <strong>
                {confirmedBookings.length}
              </strong>
            </div>
          </div>

          <div className="instructor-stat-card">
            <div className="stat-icon">
              🎓
            </div>

            <div>
              <span>
                Completed Lessons
              </span>

              <strong>
                {completedBookings.length}
              </strong>
            </div>
          </div>

        </section>

        {/* BOOKINGS */}

        <section className="bookings-section">

          <div className="bookings-section-header">

            <div>
              <span className="section-label">
                STUDENT REQUESTS
              </span>

              <h2>
                Booking Requests
              </h2>

              <p>
                Review and manage lessons
                requested by your students.
              </p>
            </div>

            <button
              type="button"
              className="refresh-bookings-button"
              onClick={loadBookings}
              disabled={bookingsLoading}
            >
              {bookingsLoading
                ? 'Loading...'
                : '↻ Refresh'}
            </button>

          </div>

          {bookingError && (
            <div className="message error-message">
              {bookingError}
            </div>
          )}

          {bookingSuccess && (
            <div className="message success-message">
              {bookingSuccess}
            </div>
          )}

          {bookingsLoading ? (

            <div className="bookings-loading">
              <div className="loading-spinner" />

              <p>
                Loading your bookings...
              </p>
            </div>

          ) : bookings.length === 0 ? (

            <div className="empty-bookings">

              <div className="empty-bookings-icon">
                📭
              </div>

              <h3>
                No bookings yet
              </h3>

              <p>
                When students request lessons
                with you, their bookings will
                appear here.
              </p>

              <Link
                to="/instructors"
                className="secondary-dashboard-button"
              >
                View Instructor Directory
              </Link>

            </div>

          ) : (

            <div className="bookings-list">

              {bookings.map((booking) => {

                const isActionLoading =
                  bookingActionId === booking._id;

                const studentName =
                  booking.student?.name || 'Student';

                const studentEmail =
                  booking.student?.email || 'Email unavailable';

                return (
                  <article
                    key={booking._id}
                    className={`booking-card ${booking.status}`}
                  >

                    {/* BOOKING TOP */}

                    <div className="booking-card-top">

                      <div className="student-info">

                        <div className="student-avatar">
                          {studentName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3>{studentName}</h3>
                          <p>{studentEmail}</p>
                        </div>

                      </div>

                      <span
                        className={`booking-status status-${booking.status}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="booking-details-grid">

                      <div className="booking-detail">
                        <span className="booking-detail-icon">
                          📅
                        </span>

                        <div>
                          <span>Date</span>

                          <strong>
                            {formatBookingDate(booking.date)}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-detail">
                        <span className="booking-detail-icon">
                          🕐
                        </span>

                        <div>
                          <span>Time</span>

                          <strong>
                            {booking.startTime}
                            {' → '}
                            {booking.endTime}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-detail">
                        <span className="booking-detail-icon">
                          📚
                        </span>

                        <div>
                          <span>Topic</span>

                          <strong>
                            {booking.topic || 'General Mathematics'}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* NOTES */}

                    {booking.notes && (
                      <div className="student-notes">
                        <span>Student notes</span>
                        <p>{booking.notes}</p>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="booking-card-actions">

                      {booking.status === 'pending' && (
                        <div className="pending-actions">

                          <div className="pending-message">
                            <span>⏳</span>
                            <strong>Student booking request</strong>
                          </div>

                          <div className="booking-action-buttons">

                            <button
                              type="button"
                              className="confirm-booking-button"
                              onClick={() =>
                                handleConfirmBooking(booking._id)
                              }
                              disabled={isActionLoading}
                            >
                              {isActionLoading
                                ? 'Confirming...'
                                : '✓ Confirm Lesson'}
                            </button>

                            <button
                              type="button"
                              className="cancel-booking-button"
                              onClick={() =>
                                handleCancelBooking(booking._id)
                              }
                              disabled={isActionLoading}
                            >
                              {isActionLoading
                                ? 'Please wait...'
                                : 'Cancel'}
                            </button>

                          </div>

                        </div>
                      )}

                      {booking.status === 'confirmed' && (
                        <div className="confirmed-actions">

                          <div className="confirmed-message">
                            <span>✓</span>
                            <strong>Lesson confirmed</strong>
                          </div>

                          <div className="booking-action-buttons">

                            <Link
                              to={`/classroom/${booking._id}`}
                              className="join-classroom-button"
                            >
                              🎥 Join Lesson
                            </Link>

                            <button
                              type="button"
                              className="complete-booking-button"
                              onClick={() =>
                                handleCompleteBooking(booking._id)
                              }
                              disabled={isActionLoading}
                            >
                              {isActionLoading
                                ? 'Please wait...'
                                : '✓ Mark Completed'}
                            </button>

                            <button
                              type="button"
                              className="cancel-booking-button"
                              onClick={() =>
                                handleCancelBooking(booking._id)
                              }
                              disabled={isActionLoading}
                            >
                              Cancel Lesson
                            </button>

                          </div>

                        </div>
                      )}

                      {booking.status === 'completed' && (
                        <div className="completed-label">
                          ✓ Lesson completed
                        </div>
                      )}

                      {booking.status === 'cancelled' && (
                        <div className="cancelled-label">
                          Lesson cancelled
                        </div>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* UPCOMING */}

        <section className="upcoming-section">

          <div className="section-heading-row">

            <div>
              <span className="section-label">
                YOUR CALENDAR
              </span>

              <h2>Upcoming Lessons</h2>
            </div>

            <span className="upcoming-count">
              {upcomingBookings.length}{' '}
              {upcomingBookings.length === 1
                ? 'lesson'
                : 'lessons'}
            </span>

          </div>

          {upcomingBookings.length === 0 ? (

            <div className="empty-upcoming">

              <span>🗓️</span>

              <div>
                <h3>No upcoming lessons</h3>

                <p>
                  Confirmed and pending lessons
                  will appear here.
                </p>
              </div>

            </div>

          ) : (

            <div className="upcoming-list">

              {upcomingBookings
                .slice(0, 5)
                .map((booking) => (
                  <div
                    key={booking._id}
                    className="upcoming-item"
                  >

                    <div className="upcoming-date">
                      <strong>
                        {formatShortDate(booking.date)}
                      </strong>

                      <span>
                        {booking.startTime}
                        {' → '}
                        {booking.endTime}
                      </span>
                    </div>

                    <div className="upcoming-student">

                      <div className="small-student-avatar">
                        {(booking.student?.name || 'S')
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {booking.student?.name || 'Student'}
                        </strong>

                        <span>
                          {booking.topic || 'Mathematics lesson'}
                        </span>
                      </div>

                    </div>

                    <span
                      className={`mini-status status-${booking.status}`}
                    >
                      {booking.status}
                    </span>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* AVAILABILITY */}

        <section className="availability-layout">

          <div className="availability-form-card">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  SCHEDULE
                </span>

                <h2>Add Availability</h2>
              </div>

              <span className="calendar-icon">
                📅
              </span>

            </div>

            <p className="section-description">
              Tell students when they can book
              a live math lesson with you.
            </p>

            <form
              onSubmit={handleAddAvailability}
              className="availability-form"
            >

              <div className="form-group">

                <label htmlFor="dayOfWeek">
                  Day
                </label>

                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={form.dayOfWeek}
                  onChange={handleChange}
                >
                  {days.map((day) => (
                    <option
                      key={day.value}
                      value={day.value}
                    >
                      {day.label}
                    </option>
                  ))}
                </select>

              </div>

              <div className="time-row">

                <div className="form-group">

                  <label htmlFor="startTime">
                    Start Time
                  </label>

                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="time-separator">
                  →
                </div>

                <div className="form-group">

                  <label htmlFor="endTime">
                    End Time
                  </label>

                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                className="add-availability-button"
                disabled={savingAvailability}
              >
                {savingAvailability
                  ? 'Adding...'
                  : '+ Add Availability'}
              </button>

            </form>

            {error && (
              <div className="message error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="message success-message">
                {success}
              </div>
            )}

          </div>

          <div className="schedule-info-card">

            <div className="info-icon">
              💡
            </div>

            <h3>How scheduling works</h3>

            <div className="info-step">
              <span>1</span>
              <p>
                Add the days and times when
                you can teach.
              </p>
            </div>

            <div className="info-step">
              <span>2</span>
              <p>
                Students will see your
                available times.
              </p>
            </div>

            <div className="info-step">
              <span>3</span>
              <p>
                Students can request a
                live lesson.
              </p>
            </div>

            <div className="info-step">
              <span>4</span>
              <p>
                Confirmed lessons connect
                to the live video classroom.
              </p>
            </div>

          </div>

        </section>

        {/* CURRENT SCHEDULE */}

        <section className="current-schedule">

          <div className="schedule-header">

            <div>
              <span className="section-label">
                YOUR WEEK
              </span>

              <h2>Current Availability</h2>
            </div>

            <span className="schedule-count">
              {availability.length}{' '}
              {availability.length === 1
                ? 'slot'
                : 'slots'}
            </span>

          </div>

          {availabilityLoading ? (

            <div className="schedule-loading">
              <div className="loading-spinner" />
              <p>Loading your schedule...</p>
            </div>

          ) : availability.length === 0 ? (

            <div className="empty-schedule">

              <div className="empty-icon">
                📅
              </div>

              <h3>No availability yet</h3>

              <p>
                Add your first available time
                above so students can book
                a lesson with you.
              </p>

            </div>

          ) : (

            <div className="weekly-schedule">

              {groupedAvailability.map((day) => (
                <div
                  key={day.value}
                  className={`day-row ${
                    day.slots.length === 0
                      ? 'empty-day'
                      : ''
                  }`}
                >

                  <div className="day-name">
                    <strong>
                      {getDayName(day.value)}
                    </strong>
                  </div>

                  <div className="day-slots">

                    {day.slots.length === 0 ? (

                      <span className="no-slot">
                        No availability
                      </span>

                    ) : (

                      day.slots.map((slot) => (
                        <div
                          key={slot._id}
                          className={`availability-slot ${
                            slot.isActive
                              ? 'active'
                              : 'inactive'
                          }`}
                        >

                          <div className="slot-time">
                            <span>{slot.startTime}</span>
                            <span className="slot-arrow">→</span>
                            <span>{slot.endTime}</span>
                          </div>

                          <span
                            className={`slot-status ${
                              slot.isActive
                                ? 'active-status'
                                : 'inactive-status'
                            }`}
                          >
                            {slot.isActive
                              ? 'Available'
                              : 'Inactive'}
                          </span>

                          <div className="slot-actions">

                            <button
                              type="button"
                              className="toggle-button"
                              onClick={() => handleToggle(slot)}
                            >
                              {slot.isActive
                                ? 'Disable'
                                : 'Enable'}
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleDelete(slot._id)}
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      ))

                    )}

                  </div>

                </div>
              ))}

            </div>

          )}

        </section>

        {/* SUMMARY */}

        <section className="lesson-summary-grid">

          <div className="summary-card">
            <span className="summary-icon">📥</span>

            <div>
              <span>Pending</span>
              <strong>{pendingBookings.length}</strong>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">✅</span>

            <div>
              <span>Confirmed</span>
              <strong>{confirmedBookings.length}</strong>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🎓</span>

            <div>
              <span>Completed</span>
              <strong>{completedBookings.length}</strong>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🚫</span>

            <div>
              <span>Cancelled</span>
              <strong>{cancelledBookings.length}</strong>
            </div>
          </div>

        </section>

        {/* NEXT FEATURES */}

        <section className="next-features">

          <div className="next-feature">
            <span>🎥</span>

            <div>
              <h3>Live Classroom</h3>

              <p>
                Confirmed lessons connect
                to a live video classroom.
              </p>
            </div>
          </div>

          <div className="next-feature">
            <span>📚</span>

            <div>
              <h3>Lesson Management</h3>

              <p>
                Manage topics, students,
                notes and learning progress.
              </p>
            </div>
          </div>

          <div className="next-feature">
            <span>💳</span>

            <div>
              <h3>Payments</h3>

              <p>
                Later, students will be able
                to pay securely when booking.
              </p>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default InstructorDashboard;