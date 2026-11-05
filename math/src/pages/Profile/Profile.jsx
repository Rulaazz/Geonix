
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useUser } from '../../components/UserContext/UserContext';
import './Profile.css';

const API_URL = 'http://localhost:5001';

const INITIAL_FORM = {
  name: '',
  email: '',
  gradeLevel: '',
  learningGoal: '',
  bio: '',
};

const Profile = () => {
  const { user, login } = useUser();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      gradeLevel: user.gradeLevel || '',
      learningGoal: user.learningGoal || '',
      bio: user.bio || '',
    });

    const fetchProfileData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Please log in again.');
        }

        const response = await axios.get(
          `${API_URL}/api/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const progress = response.data || {};
        const questionsAnswered =
          Number(progress.questionsAnswered) || 0;
        const correctAnswers =
          Number(progress.correctAnswers) || 0;

        const accuracy = questionsAnswered > 0
          ? Math.round(
              (correctAnswers / questionsAnswered) * 100
            )
          : 0;

        setStats({
          questionsAnswered,
          correctAnswers,
          accuracy,
        });
      } catch (requestError) {
        console.error(
          'PROFILE PROGRESS ERROR:',
          requestError
        );

        setStats({
          questionsAnswered: 0,
          correctAnswers: 0,
          accuracy: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const response = await axios.put(
        `${API_URL}/api/auth/me`,
        {
          name: formData.name.trim(),
          gradeLevel: formData.gradeLevel,
          learningGoal: formData.learningGoal,
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      if (!updatedUser) {
        throw new Error(
          'The server did not return the updated profile.'
        );
      }

      // Refresh the shared user state and localStorage.
      login({
        ...user,
        ...updatedUser,
      });

      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        gradeLevel: updatedUser.gradeLevel || '',
        learningGoal: updatedUser.learningGoal || '',
        bio: updatedUser.bio || '',
      });

      setSuccess('Your profile has been updated successfully.');
    } catch (requestError) {
      console.error('PROFILE UPDATE ERROR:', requestError);

      if (requestError.response?.data?.message) {
        setError(requestError.response.data.message);
      } else if (requestError.message) {
        setError(requestError.message);
      } else {
        setError('Could not update your profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = (formData.name || user?.name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          Please log in to view your profile.
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <section className="profile-hero">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-hero-info">
            <p className="profile-role">
              {user.role === 'admin'
                ? 'Geonix Admin'
                : user.role === 'instructor'
                  ? 'Geonix Instructor'
                  : 'Geonix Student'}
            </p>

            <h1>{formData.name || user.name}</h1>
            <p>{user.email}</p>
          </div>
        </section>

        <section className="profile-stats">
          <article className="profile-stat-card">
            <span className="profile-stat-icon">📘</span>
            <div>
              <p>Questions Answered</p>
              <strong>
                {loading ? '…' : stats.questionsAnswered}
              </strong>
            </div>
          </article>

          <article className="profile-stat-card">
            <span className="profile-stat-icon">✓</span>
            <div>
              <p>Correct Answers</p>
              <strong>
                {loading ? '…' : stats.correctAnswers}
              </strong>
            </div>
          </article>

          <article className="profile-stat-card">
            <span className="profile-stat-icon">📈</span>
            <div>
              <p>Accuracy</p>
              <strong>
                {loading ? '…' : `${stats.accuracy}%`}
              </strong>
            </div>
          </article>
        </section>

        <section className="profile-content">
          <div className="profile-card">
            <div className="profile-section-heading">
              <h2>Learning Profile</h2>
              <p>
                Your learning information and personal details.
              </p>
            </div>

            <div className="profile-detail">
              <span>Grade Level</span>
              <strong>
                {formData.gradeLevel || 'Not set yet'}
              </strong>
            </div>

            <div className="profile-detail">
              <span>Learning Goal</span>
              <strong>
                {formData.learningGoal || 'Not set yet'}
              </strong>
            </div>

            <div className="profile-detail">
              <span>Email Address</span>
              <strong>{user.email}</strong>
            </div>

            <div className="profile-detail">
              <span>About Me</span>
              <p>{formData.bio || 'No biography added yet.'}</p>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-section-heading">
              <h2>Edit Profile</h2>
              <p>Update your personal learning information.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="profile-form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  autoComplete="email"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="gradeLevel">Grade Level</label>
                <select
                  id="gradeLevel"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                >
                  <option value="">Select your level</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                  <option value="Adult">Adult</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label htmlFor="learningGoal">Learning Goal</label>
                <select
                  id="learningGoal"
                  name="learningGoal"
                  value={formData.learningGoal}
                  onChange={handleChange}
                >
                  <option value="">Select your goal</option>
                  <option value="Improve my grades">
                    Improve my grades
                  </option>
                  <option value="Prepare for exams">
                    Prepare for exams
                  </option>
                  <option value="Build strong foundations">
                    Build strong foundations
                  </option>
                  <option value="Practice regularly">
                    Practice regularly
                  </option>
                  <option value="Learn advanced mathematics">
                    Learn advanced mathematics
                  </option>
                </select>
              </div>

              <div className="profile-form-group">
                <label htmlFor="bio">About Me</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell us a little about your learning goals..."
                />
              </div>

              {error && (
                <div className="profile-error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="profile-success" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;
