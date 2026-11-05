
import { API_BASE_URL } from '../../config/api';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../components/UserContext/UserContext';

import './MyLessons.css';


const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✓',
  completed: '🏆',
  cancelled: '✕',
};

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const getBookingStatus = (booking) =>
  (booking?.status || 'pending').toLowerCase();

const getStatusLabel = (status) =>
  STATUS_LABELS[status] || 'Pending';

const getInstructorName = (booking) =>
  booking?.instructor?.name || 'Instructor';

const getInstructorEmail = (booking) =>
  booking?.instructor?.email || '';

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  if (!value) return null;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );

  return Number.isNaN(date.getTime()) ? null : date;
};

const getBookingDateTime = (booking, timeField = 'startTime') => {
  const date = parseLocalDate(booking?.date);
  const time = booking?.[timeField];

  if (!date || !time) return null;

  const match = String(time).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  date.setHours(hours, minutes, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) => {
  const parsedDate = parseLocalDate(date);

  if (!parsedDate) return 'Date not available';

  return parsedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatShortDate = (date) => {
  const parsedDate = parseLocalDate(date);

  if (!parsedDate) return 'Date not available';

  return parsedDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isFutureBooking = (booking) => {
  const start = getBookingDateTime(booking);

  return Boolean(start && start >= new Date());
};

/*
 * A confirmed lesson can be joined:
 * 10 minutes before its scheduled start,
 * until 60 minutes after its scheduled start.
 */
const canJoinLesson = (booking, now = new Date()) => {
  if (getBookingStatus(booking) !== 'confirmed') {
    return false;
  }

  const start = getBookingDateTime(booking);

  if (!start) return false;

  const opensAt = start.getTime() - 10 * 60 * 1000;
  const closesAt = start.getTime() + 60 * 60 * 1000;

  return now.getTime() >= opensAt && now.getTime() <= closesAt;
};

const getJoinMessage = (booking, now = new Date()) => {
  if (getBookingStatus(booking) !== 'confirmed') {
    return 'Waiting for instructor confirmation';
  }

  const start = getBookingDateTime(booking);

  if (!start) return 'Lesson time is unavailable';

  const opensAt = new Date(start.getTime() - 10 * 60 * 1000);
  const closesAt = new Date(start.getTime() + 60 * 60 * 1000);

  if (now < opensAt) {
    return `Join opens at ${opensAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  if (now > closesAt) {
    return 'The joining window has ended';
  }

  return 'You can join now';
};

const getDayNumber = (value) => {
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    return WEEKDAYS.findIndex(
      (day) => day.toLowerCase() === trimmed.toLowerCase()
    );
  }

  return -1;
};

const getResponseArray = (data, keys) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

function MyLessons() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  const [instructors, setInstructors] = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Keep time-sensitive join buttons up to date.
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const isInstructor = user?.role === 'instructor';
  const canBookLesson = !isInstructor && user?.role !== 'admin';

  /*
   * LOAD BOOKINGS
   */
  const loadBookings = useCallback(
    async (showRefresh = false) => {
      if (!token) {
        setBookings([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response = await axios.get(
          `${API_BASE_URL}/api/bookings/my`,
          authConfig
        );

        const receivedBookings = Array.isArray(response?.data?.bookings)
          ? response.data.bookings
          : [];

        const currentUserId = user?._id || user?.id || '';

        const normalizedBookings = receivedBookings.filter((booking) => {
          if (!currentUserId) return true;

          const studentId =
            booking?.student?._id || booking?.student || '';

          const instructorId =
            booking?.instructor?._id || booking?.instructor || '';

          return (
            String(studentId) === String(currentUserId) ||
            String(instructorId) === String(currentUserId)
          );
        });

        setBookings(normalizedBookings);
      } catch (requestError) {
        console.error('LOAD BOOKINGS ERROR:', requestError);

        setError(
          requestError?.response?.data?.message ||
            'Could not load your lessons.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authConfig, token, user]
  );

  useEffect(() => {
    if (!userLoading) {
      loadBookings(false);
    }
  }, [userLoading, loadBookings]);

  useEffect(() => {
    if (!token || userLoading) return undefined;

    const refreshInterval = setInterval(() => {
      loadBookings(true);
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, [token, userLoading, loadBookings]);

  useEffect(() => {
    const handleFocus = () => loadBookings(true);

    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [loadBookings]);

  /*
   * LOAD INSTRUCTORS
   */
  useEffect(() => {
    if (!canBookLesson || userLoading || !token) {
      return undefined;
    }

    let cancelled = false;

    const loadInstructors = async () => {
      try {
        setInstructorsLoading(true);
        setBookingError('');

        const response = await axios.get(
          `${API_BASE_URL}/api/instructors`,
          authConfig
        );

        const list = getResponseArray(response.data, ['instructors']);

        if (!cancelled) setInstructors(list);
      } catch (requestError) {
        console.error('LOAD BOOKING INSTRUCTORS ERROR:', requestError);

        if (!cancelled) {
          setBookingError(
            requestError?.response?.data?.message ||
              'Could not load instructors. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setInstructorsLoading(false);
      }
    };

    loadInstructors();

    return () => {
      cancelled = true;
    };
  }, [authConfig, canBookLesson, token, userLoading]);

  /*
   * LOAD INSTRUCTOR AVAILABILITY
   */
  useEffect(() => {
    if (!selectedInstructorId || !token) {
      setAvailability([]);
      setSelectedSlot('');
      return undefined;
    }

    let cancelled = false;

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setBookingError('');
        setAvailability([]);
        setSelectedSlot('');

        const response = await axios.get(
          `${API_BASE_URL}/api/availability/instructor/${selectedInstructorId}`,
          authConfig
        );

        const slots = getResponseArray(response.data, [
          'availability',
          'slots',
          'items',
        ]);

        if (!cancelled) setAvailability(slots);
      } catch (requestError) {
        console.error('LOAD AVAILABILITY ERROR:', requestError);

        if (!cancelled) {
          setBookingError(
            requestError?.response?.data?.message ||
              'Could not load this instructor’s availability.'
          );
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [authConfig, selectedInstructorId, token]);

  const selectedInstructor = useMemo(
    () =>
      instructors.find(
        (instructor) =>
          String(instructor?.user?._id || '') ===
          String(selectedInstructorId)
      ) || null,
    [instructors, selectedInstructorId]
  );

  const availableSlots = useMemo(() => {
    const date = parseLocalDate(selectedDate);

    if (!date) return [];

    const dayNumber = date.getDay();

    return availability
      .filter((slot) => {
        if (slot?.isActive === false) return false;

        return getDayNumber(slot?.dayOfWeek) === dayNumber;
      })
      .filter((slot) => slot?.startTime && slot?.endTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [availability, selectedDate]);

  useEffect(() => {
    if (
      selectedSlot &&
      !availableSlots.some(
        (slot) => `${slot.startTime}-${slot.endTime}` === selectedSlot
      )
    ) {
      setSelectedSlot('');
    }
  }, [availableSlots, selectedSlot]);

  /*
   * CANCEL BOOKING
   */
  const handleCancel = async (bookingId) => {
    const shouldCancel = window.confirm(
      'Are you sure you want to cancel this lesson?'
    );

    if (!shouldCancel) return;

    try {
      setCancellingId(bookingId);
      setError('');
      setSuccess('');

      await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        authConfig
      );

      setSuccess('Lesson cancelled successfully.');
      await loadBookings(true);
    } catch (requestError) {
      console.error('CANCEL BOOKING ERROR:', requestError);

      setError(
        requestError?.response?.data?.message ||
          'Could not cancel this lesson.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  /*
   * JOIN LESSON
   */
  const handleJoinLesson = (booking) => {
    if (!booking?._id || !canJoinLesson(booking)) return;

    setJoiningId(booking._id);
    navigate(`/classroom/${booking._id}`);
  };

  /*
   * SUBMIT NEW BOOKING
   */
  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    setBookingError('');
    setBookingSuccess('');
    setError('');
    setSuccess('');

    if (!selectedInstructorId) {
      setBookingError('Please select an instructor.');
      return;
    }

    if (!selectedDate) {
      setBookingError('Please select a lesson date.');
      return;
    }

    if (!selectedSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }

    if (!topic.trim()) {
      setBookingError('Please enter the lesson topic.');
      return;
    }

    const [startTime, endTime] = selectedSlot.split('-');

    try {
      setBookingSubmitting(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/bookings`,
        {
          instructorId: selectedInstructorId,
          date: selectedDate,
          startTime,
          endTime,
          topic: topic.trim(),
          notes: notes.trim(),
        },
        authConfig
      );

      setBookingSuccess(
        response?.data?.message ||
          'Your lesson request was submitted. It is waiting for instructor confirmation.'
      );

      setSelectedInstructorId('');
      setSelectedDate('');
      setSelectedSlot('');
      setTopic('');
      setNotes('');
      setAvailability([]);
      setShowBookingForm(false);

      await loadBookings(true);
    } catch (requestError) {
      console.error('CREATE BOOKING ERROR:', requestError);

      setBookingError(
        requestError?.response?.data?.message ||
          'Could not submit your lesson request. Please try another time slot.'
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  /*
   * FILTERS AND COUNTS
   */
  const filteredBookings = useMemo(() => {
    if (activeFilter === 'all') return bookings;

    return bookings.filter(
      (booking) => getBookingStatus(booking) === activeFilter
    );
  }, [activeFilter, bookings]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter(
        (booking) => getBookingStatus(booking) === 'pending'
      ).length,
      confirmed: bookings.filter(
        (booking) => getBookingStatus(booking) === 'confirmed'
      ).length,
      completed: bookings.filter(
        (booking) => getBookingStatus(booking) === 'completed'
      ).length,
      cancelled: bookings.filter(
        (booking) => getBookingStatus(booking) === 'cancelled'
      ).length,
    }),
    [bookings]
  );

  /*
   * NEXT LESSON
   * Show the nearest pending or confirmed lesson.
   * Keep confirmed lessons visible during their join window.
   */
  const upcomingBooking = useMemo(
    () =>
      bookings
        .filter((booking) => {
          const status = getBookingStatus(booking);

          if (!['pending', 'confirmed'].includes(status)) {
            return false;
          }

          return (
            isFutureBooking(booking) ||
            canJoinLesson(booking, currentTime)
          );
        })
        .sort((a, b) => {
          const dateA = getBookingDateTime(a)?.getTime() ?? Infinity;
          const dateB = getBookingDateTime(b)?.getTime() ?? Infinity;

          return dateA - dateB;
        })[0] || null,
    [bookings, currentTime]
  );

  /*
   * LOADING
   */
  if (userLoading || loading) {
    return (
      <div className="my-lessons-page">
        <div className="my-lessons-loading">
          <div className="loading-spinner" />
          <p>Loading your lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-lessons-page">
      <main className="my-lessons-container">
        {/* PAGE HEADER */}
        <header className="my-lessons-heading">
          <div>
            <p className="page-eyebrow">YOUR LEARNING</p>
            <h1>My Lessons</h1>
            <p className="page-description">
              Book a new lesson, manage your schedule, and join confirmed classes.
            </p>
          </div>

          <div className="heading-actions">
            <button
              type="button"
              className="refresh-button"
              onClick={() => loadBookings(true)}
              disabled={refreshing}
            >
              <span
                className={
                  refreshing ? 'refresh-icon spinning' : 'refresh-icon'
                }
              >
                ↻
              </span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            {canBookLesson && (
              <button
                type="button"
                className="new-lesson-button"
                onClick={() => {
                  setShowBookingForm((current) => !current);
                  setBookingError('');
                  setBookingSuccess('');
                }}
              >
                {showBookingForm ? 'Close Form' : '+ Book a New Lesson'}
              </button>
            )}
          </div>
        </header>

        {/* PAGE MESSAGES */}
        {success && (
          <div className="message-box success-message" role="status">
            <span>✓</span>
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess('')}
              aria-label="Close success message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="message-box error-message" role="alert">
            <span>!</span>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}

        {/* BOOKING FORM */}
        {canBookLesson && showBookingForm && (
          <section className="booking-form-card" id="new-lesson-form">
            <div className="booking-form-heading">
              <div>
                <p className="section-eyebrow">START LEARNING</p>
                <h2>Book a New Lesson</h2>
                <p>Choose an instructor and a time that fits your schedule.</p>
              </div>
              <span className="booking-form-icon">📚</span>
            </div>

            {bookingSuccess && (
              <div className="message-box success-message" role="status">
                <span>✓</span>
                <span>{bookingSuccess}</span>
                <button
                  type="button"
                  onClick={() => setBookingSuccess('')}
                  aria-label="Close booking success message"
                >
                  ×
                </button>
              </div>
            )}

            {bookingError && (
              <div className="message-box error-message" role="alert">
                <span>!</span>
                <span>{bookingError}</span>
                <button
                  type="button"
                  onClick={() => setBookingError('')}
                  aria-label="Close booking error message"
                >
                  ×
                </button>
              </div>
            )}

            {instructorsLoading ? (
              <div className="booking-inline-loading">
                <div className="loading-spinner" />
                <p>Loading instructors...</p>
              </div>
            ) : instructors.length === 0 ? (
              <div className="booking-empty-state">
                <span>👩‍🏫</span>
                <h3>No instructors available</h3>
                <p>
                  There are currently no instructor profiles to book.
                  Please try again later.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="booking-form-grid">
                  <div className="form-field">
                    <label htmlFor="booking-instructor">
                      Instructor *
                    </label>
                    <select
                      id="booking-instructor"
                      value={selectedInstructorId}
                      onChange={(event) => {
                        setSelectedInstructorId(event.target.value);
                        setSelectedSlot('');
                        setBookingError('');
                      }}
                      required
                    >
                      <option value="">Choose an instructor</option>
                      {instructors.map((instructor) => {
                        const userId = instructor?.user?._id;

                        if (!userId) return null;

                        return (
                          <option key={userId} value={userId}>
                            {instructor.user?.name || 'Math Instructor'}
                            {instructor.subjects?.length
                              ? ` — ${instructor.subjects
                                  .slice(0, 2)
                                  .join(', ')}`
                              : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="booking-date">Lesson date *</label>
                    <input
                      id="booking-date"
                      type="date"
                      value={selectedDate}
                      min={getLocalDateString()}
                      onChange={(event) => {
                        setSelectedDate(event.target.value);
                        setSelectedSlot('');
                        setBookingError('');
                      }}
                      required
                    />
                  </div>
                </div>

                {selectedInstructorId && selectedDate && (
                  <div className="availability-panel">
                    <div className="availability-heading">
                      <div>
                        <h3>Available time slots</h3>
                        <p>{formatDate(selectedDate)}</p>
                      </div>

                      {availabilityLoading && (
                        <span className="availability-loading-label">
                          Loading times...
                        </span>
                      )}
                    </div>

                    {availabilityLoading ? (
                      <div className="slot-loading">
                        <div className="loading-spinner" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="no-slots-message">
                        No availability was found for this date. Try another date.
                      </p>
                    ) : (
                      <div className="time-slot-grid">
                        {availableSlots.map((slot) => {
                          const slotValue =
                            `${slot.startTime}-${slot.endTime}`;
                          const selected = selectedSlot === slotValue;

                          return (
                            <button
                              key={`${slot.dayOfWeek}-${slotValue}`}
                              type="button"
                              className={
                                selected
                                  ? 'time-slot-button selected'
                                  : 'time-slot-button'
                              }
                              onClick={() => setSelectedSlot(slotValue)}
                              aria-pressed={selected}
                            >
                              <span>🕒</span>
                              {slot.startTime} – {slot.endTime}
                              {selected && (
                                <span className="slot-check">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <p className="availability-note">
                      The server checks the final availability when you submit.
                    </p>
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="booking-topic">Lesson topic *</label>
                  <input
                    id="booking-topic"
                    type="text"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="e.g. Algebra, fractions, geometry..."
                    maxLength={120}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-notes">Notes (optional)</label>
                  <textarea
                    id="booking-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Tell the instructor what you would like to focus on."
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                {selectedInstructor && (
                  <div className="selected-instructor-summary">
                    <span className="summary-avatar">
                      {selectedInstructor.avatar ? (
                        <img src={selectedInstructor.avatar} alt="" />
                      ) : (
                        (selectedInstructor.user?.name || 'M')
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </span>

                    <div>
                      <strong>
                        {selectedInstructor.user?.name || 'Math Instructor'}
                      </strong>
                      <span>
                        {selectedInstructor.subjects?.length
                          ? selectedInstructor.subjects.join(', ')
                          : 'Mathematics'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="booking-form-footer">
                  <p>
                    Your request will remain pending until the instructor confirms it.
                  </p>

                  <button
                    type="submit"
                    className="submit-booking-button"
                    disabled={bookingSubmitting || availabilityLoading}
                  >
                    {bookingSubmitting
                      ? 'Submitting Request...'
                      : 'Request Lesson →'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* NEXT LESSON */}
        {upcomingBooking && (
          <section className="upcoming-lesson-card">
            <div className="upcoming-lesson-content">
              <div className="next-lesson-heading">
                <span className="next-lesson-indicator" />
                <h2>Next Lesson</h2>
              </div>

              <h3 className="next-lesson-topic">
                {upcomingBooking.topic || 'Math Lesson'}
              </h3>

              <p className="upcoming-instructor">
                with <strong>{getInstructorName(upcomingBooking)}</strong>
              </p>

              <div className="upcoming-details">
                <span>
                  <span aria-hidden="true">📅</span>
                  {formatShortDate(upcomingBooking.date)}
                </span>

                <span>
                  <span aria-hidden="true">🕐</span>
                  {upcomingBooking.startTime} – {upcomingBooking.endTime}
                </span>

                <span
                  className={`upcoming-status ${getBookingStatus(
                    upcomingBooking
                  )}`}
                >
                  {STATUS_ICONS[getBookingStatus(upcomingBooking)]}{' '}
                  {getStatusLabel(getBookingStatus(upcomingBooking))}
                </span>
              </div>
            </div>

            <div className="upcoming-actions">
              {canJoinLesson(upcomingBooking, currentTime) ? (
                <button
                  type="button"
                  className="join-upcoming-button"
                  onClick={() => handleJoinLesson(upcomingBooking)}
                  disabled={joiningId === upcomingBooking._id}
                >
                  {joiningId === upcomingBooking._id
                    ? 'Opening...'
                    : 'Join Lesson →'}
                </button>
              ) : (
                <span className="waiting-label">
                  {getJoinMessage(upcomingBooking, currentTime)}
                </span>
              )}
            </div>
          </section>
        )}

        {/* BOOKINGS */}
        <section className="lessons-section">
          <div className="section-title-row">
            <div>
              <p className="section-eyebrow">SCHEDULE</p>
              <h2>Your Bookings</h2>
            </div>

            <div className="booking-count">
              {filteredBookings.length}{' '}
              {filteredBookings.length === 1 ? 'lesson' : 'lessons'}
            </div>
          </div>

          {/* FILTERS */}
          <div className="lesson-filters">
            {[
              ['all', 'All'],
              ['pending', 'Pending'],
              ['confirmed', 'Confirmed'],
              ['completed', 'Completed'],
              ['cancelled', 'Cancelled'],
            ].map(([filter, label]) => (
              <button
                key={filter}
                type="button"
                className={`filter-button ${filter} ${
                  activeFilter === filter ? 'active' : ''
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {label}
                <span>{counts[filter]}</span>
              </button>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredBookings.length === 0 && (
            <div className="empty-lessons">
              <div className="empty-icon">📅</div>
              <h3>No lessons found</h3>
              <p>
                {activeFilter === 'all'
                  ? 'You do not have any lessons scheduled yet.'
                  : `You do not have any ${activeFilter} lessons.`}
              </p>

              {canBookLesson ? (
                <button
                  type="button"
                  className="find-instructor-button"
                  onClick={() => {
                    setShowBookingForm(true);
                    setBookingError('');
                    setBookingSuccess('');
                  }}
                >
                  Book a Lesson →
                </button>
              ) : (
                <Link to="/dashboard" className="find-instructor-button">
                  Back to Dashboard →
                </Link>
              )}
            </div>
          )}

          {/* BOOKING LIST */}
          {filteredBookings.length > 0 && (
            <div className="lessons-list">
              {filteredBookings.map((booking) => {
                const status = getBookingStatus(booking);
                const isCancelling = cancellingId === booking._id;
                const isJoining = joiningId === booking._id;
                const parsedBookingDate = parseLocalDate(booking.date);
                const joinAllowed = canJoinLesson(booking, currentTime);

                return (
                  <article
                    key={booking._id}
                    className={`lesson-card ${status}`}
                  >
                    <div className="lesson-card-top">
                      <div className="lesson-date-block">
                        <span className="lesson-month">
                          {parsedBookingDate
                            ? parsedBookingDate.toLocaleDateString(
                                undefined,
                                { month: 'short' }
                              )
                            : '---'}
                        </span>

                        <strong className="lesson-day">
                          {parsedBookingDate
                            ? parsedBookingDate.getDate()
                            : '--'}
                        </strong>

                        <span className="lesson-year">
                          {parsedBookingDate
                            ? parsedBookingDate.getFullYear()
                            : '----'}
                        </span>
                      </div>

                      <div className="lesson-main-info">
                        <div className="lesson-title-row">
                          <h3>{booking.topic || 'Math Lesson'}</h3>

                          <span className={`status-badge ${status}`}>
                            {STATUS_ICONS[status] || '•'}{' '}
                            {getStatusLabel(status)}
                          </span>
                        </div>

                        <p className="lesson-instructor">
                          <span>👨‍🏫</span>
                          <span>{getInstructorName(booking)}</span>
                        </p>

                        {getInstructorEmail(booking) && (
                          <p className="lesson-email">
                            {getInstructorEmail(booking)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="lesson-details">
                      <div className="lesson-detail">
                        <span className="detail-icon">📅</span>
                        <div>
                          <span className="detail-label">Date</span>
                          <strong>{formatDate(booking.date)}</strong>
                        </div>
                      </div>

                      <div className="lesson-detail">
                        <span className="detail-icon">🕐</span>
                        <div>
                          <span className="detail-label">Time</span>
                          <strong>
                            {booking.startTime || '--'} –{' '}
                            {booking.endTime || '--'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="lesson-notes">
                        <span>📝</span>
                        <div>
                          <strong>Notes</strong>
                          <p>{booking.notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="lesson-actions">
                      {status === 'pending' && (
                        <>
                          <div className="pending-message">
                            <span>⏳</span>
                            <span>
                              Waiting for the instructor to confirm this lesson.
                            </span>
                          </div>

                          <button
                            type="button"
                            className="cancel-lesson-button"
                            onClick={() => handleCancel(booking._id)}
                            disabled={isCancelling}
                          >
                            {isCancelling
                              ? 'Cancelling...'
                              : 'Cancel Request'}
                          </button>
                        </>
                      )}

                      {status === 'confirmed' && (
                        <>
                          <div className="confirmed-message">
                            <span>✓</span>
                            <span>
                              {joinAllowed
                                ? 'Your lesson is ready to join.'
                                : getJoinMessage(booking, currentTime)}
                            </span>
                          </div>

                          <div className="confirmed-actions">
                            <button
                              type="button"
                              className="join-lesson-button"
                              onClick={() => handleJoinLesson(booking)}
                              disabled={!joinAllowed || isJoining}
                              title={
                                joinAllowed
                                  ? 'Join your lesson'
                                  : getJoinMessage(booking, currentTime)
                              }
                            >
                              {isJoining
                                ? 'Opening...'
                                : joinAllowed
                                  ? '🎥 Join Lesson'
                                  : '🔒 Join Lesson'}
                            </button>

                            <button
                              type="button"
                              className="cancel-lesson-button"
                              onClick={() => handleCancel(booking._id)}
                              disabled={isCancelling}
                            >
                              {isCancelling ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </div>
                        </>
                      )}

                      {status === 'completed' && (
                        <div className="completed-message">
                          <span>🏆</span>
                          <span>This lesson has been completed.</span>
                        </div>
                      )}

                      {status === 'cancelled' && (
                        <div className="cancelled-message">
                          <span>✕</span>
                          <span>This lesson was cancelled.</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* LEARNING CTA */}
        <section className="my-lessons-cta">
          <div className="cta-content">
            <span className="cta-icon">🚀</span>
            <div>
              <h2>Keep Learning</h2>
              <p>
                Practice math or explore video lessons while you wait for your next class.
              </p>
            </div>
          </div>

          <div className="cta-actions">
            <Link to="/practice" className="cta-button secondary">
              Practice Math
            </Link>

            <Link to="/video-lessons" className="cta-button primary">
              Video Lessons
            </Link>
          </div>
        </section>

        {/* STATISTICS AT THE BOTTOM */}
        <section className="lesson-stats">
          <div className="lesson-stat-card">
            <span className="lesson-stat-icon">📚</span>
            <div>
              <span className="lesson-stat-value">{counts.all}</span>
              <span className="lesson-stat-label">Total Lessons</span>
            </div>
          </div>

          <div className="lesson-stat-card">
            <span className="lesson-stat-icon">⏳</span>
            <div>
              <span className="lesson-stat-value">{counts.pending}</span>
              <span className="lesson-stat-label">Pending</span>
            </div>
          </div>

          <div className="lesson-stat-card">
            <span className="lesson-stat-icon">✓</span>
            <div>
              <span className="lesson-stat-value">{counts.confirmed}</span>
              <span className="lesson-stat-label">Confirmed</span>
            </div>
          </div>

          <div className="lesson-stat-card">
            <span className="lesson-stat-icon">🏆</span>
            <div>
              <span className="lesson-stat-value">{counts.completed}</span>
              <span className="lesson-stat-label">Completed</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MyLessons;
