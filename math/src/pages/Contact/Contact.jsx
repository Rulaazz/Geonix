
import React, { useState } from 'react';
import './Contact.css';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5001';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};

function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (status !== 'idle') {
      setStatus('idle');
      setFeedback('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setFeedback('');

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || 'We could not send your message. Please try again.'
        );
      }

      setStatus('success');
      setFeedback(
        data.message || 'Your message was sent successfully!'
      );
      setForm(initialForm);
    } catch (error) {
      setStatus('error');
      setFeedback(
        error.message ||
          'Unable to connect to Geonix. Please try again later.'
      );
    }
  };

  return (
    <section className="contact-page">
      <div className="contact-hero">
        <span className="contact-eyebrow">WE ARE HERE TO HELP</span>
        <h1>Contact Geonix</h1>
        <p>
          Have a question about lessons, your account, or our packages?
          Send us a message and our team will get back to you.
        </p>
      </div>

      <div className="contact-container">
        <aside className="contact-info">
          <div className="contact-info-icon" aria-hidden="true">
            ✉
          </div>

          <h2>Let’s talk about math.</h2>
          <p>
            We would love to hear from you. Send us your question,
            feedback, or suggestion.
          </p>

          <div className="contact-detail">
            <span className="contact-detail-label">EMAIL US</span>
            <a href="mailto:geonix.0509@gmail.com">
              geonix.0509@gmail.com
            </a>
          </div>

          <div className="contact-detail">
            <span className="contact-detail-label">OUR MISSION</span>
            <p>Learn. Practice. Improve.</p>
          </div>
        </aside>

        <div className="contact-form-card">
          <h2>Send us a message</h2>
          <p className="contact-form-intro">
            Fill out the form below. All fields are required.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="contact-field">
              <label htmlFor="contact-name">Full name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
                disabled={status === 'sending'}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Email address</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                maxLength={254}
                autoComplete="email"
                required
                disabled={status === 'sending'}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                minLength={2}
                maxLength={150}
                required
                disabled={status === 'sending'}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={6}
                minLength={10}
                maxLength={5000}
                required
                disabled={status === 'sending'}
              />
            </div>

            <div className="contact-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">
                Leave this field empty
              </label>
              <input
                id="contact-website"
                name="website"
                type="text"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {feedback && (
              <div
                className={`contact-feedback contact-feedback-${status}`}
                role="status"
                aria-live="polite"
              >
                {feedback}
              </div>
            )}

            <button
              className="contact-submit"
              type="submit"
              disabled={status === 'sending'}
            >
              {status === 'sending'
                ? 'Sending...'
                : 'Send Message →'}
            </button>
          </form>

          <p className="contact-privacy-note">
            Your message will be sent to the Geonix support email.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
