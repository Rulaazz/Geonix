import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../components/UserContext/UserContext';
import '../Login/Login.css';

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
      // 1. Login
      const response = await axios.post(
        'http://localhost:5001/api/auth/login',
        form
      );

      const token = response.data.token;

      // 2. Save JWT token
      localStorage.setItem('token', token);

      // 3. Get the real user information
      const userResponse = await axios.get(
        'http://localhost:5001/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 4. Save the real user in UserContext
      login(userResponse.data.user);

      // 5. Go to Dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('LOGIN ERROR:', error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
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

          <h1>
            Welcome Back 👋
          </h1>

          <p>
            Log in to continue your math practice.
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
              required
            />

          </div>

          {error && (
            <div className="login-error">
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

          <span>
            Don't have an account?
          </span>

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
