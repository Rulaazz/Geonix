
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import { useUser } from '../../components/UserContext/UserContext';
import '../Login/Login.css';

const API_URL = 'http://localhost:5001';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: form.email.trim(),
          password: form.password,
        }
      );

      const token = response.data.token;

      if (!token) {
        throw new Error('The server did not return an authentication token.');
      }

      localStorage.setItem('token', token);

      const userResponse = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = userResponse.data.user;

      if (!user || !user.role) {
        throw new Error(
          'Could not determine your account role. Please try again.'
        );
      }

      login(user);

      if (user.role === 'instructor') {
        navigate('/instructor-dashboard', {
          replace: true,
        });
      } else if (user.role === 'admin') {
        // Keep admins on the existing dashboard until an admin
        // dashboard route is configured in App.js.
        navigate('/dashboard', {
          replace: true,
        });
      } else {
        navigate('/dashboard', {
          replace: true,
        });
      }
    } catch (err) {
      console.error('LOGIN ERROR:', err);

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          Geonix
        </div>

        <div className="login-intro">
          <h1>Welcome Back 👋</h1>

          <p>
            Log in to continue your Geonix learning experience.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="login-signup">
          <span>Don't have an account?</span>

          <Link to="/signup">
            Create an account
          </Link>
        </div>

        <Link
          to="/"
          className="login-home"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Login;
