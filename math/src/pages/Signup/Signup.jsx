import { API_BASE_URL } from '../../config/api';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, form);
      navigate('/login');
    } catch (err) {
  console.log('Signup error:', err);

  if (err.response?.data?.message) {
    setError(err.response.data.message);
  } else if (err.request) {
    setError('Could not connect to the server. Make sure the backend is running.');
  } else {
    setError('Something went wrong. Please try again.');
  }
}
  };

return (
  <div className="signup-page">
    <div className="signup-card">

      <div className="signup-brand">
        <div className="signup-icon">
          <img
            src="/GeonixIcon.ico"
            alt="Geonix"
          />
        </div>

        <h1>Geonix</h1>
        <p>Create your account</p>
      </div>

      <form onSubmit={handleSignup} className="signup-form">

        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="signup-button">
          Create Account
        </button>

      </form>

      <div className="signup-footer">
        <span>Already have an account?</span>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="login-link"
        >
          Log in
        </button>
      </div>

    </div>
  </div>
);}