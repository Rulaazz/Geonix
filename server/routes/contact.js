
const express = require('express');
const { Resend } = require('resend');

const router = express.Router();

const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const requestsByIp = new Map();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initialize Resend once.
const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null;

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return replacements[character];
  });
}

function getClientIp(req) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestsByIp.get(ip);

  if (!entry || now - entry.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestsByIp.set(ip, {
      startedAt: now,
      count: 1,
    });

    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

router.post('/', async (req, res) => {
  const { website } = req.body || {};

  // Honeypot protection.
  if (typeof website === 'string' && website.trim() !== '') {
    return res.status(200).json({
      message: 'Your message was received.',
    });
  }

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res.status(429).json({
      message: 'Too many messages. Please try again in 15 minutes.',
    });
  }

  const name = cleanText(req.body?.name);
  const email = cleanText(req.body?.email);
  const subject = cleanText(req.body?.subject);
  const message = cleanText(req.body?.message);

  // Validate form fields.
  if (
    name.length < 2 ||
    name.length > 100 ||
    !emailPattern.test(email) ||
    email.length > 254 ||
    subject.length < 2 ||
    subject.length > 150 ||
    message.length < 10 ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return res.status(400).json({
      message: 'Please check all fields and try again.',
    });
  }

  try {
    if (!resend || !CONTACT_EMAIL) {
      throw new Error('Resend email service is not configured.');
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const { data, error } = await resend.emails.send({
      from: 'Geonix Contact Form <onboarding@resend.dev>',
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject: `Geonix Contact: ${subject}`,

      text: [
        'New message from the Geonix website',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
      ].join('\n'),

      html: `
        <h2>New message from the Geonix website</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend delivery failed:', error.message);
      throw new Error('Email provider rejected the message.');
    }

    console.log('Geonix contact email sent successfully:', data.id);

    return res.status(200).json({
      message: 'Thank you! Your message was sent successfully.',
    });

  } catch (error) {
    console.error('Contact email delivery failed:', error.message);

    return res.status(500).json({
      message:
        'We could not send your message right now. Please try again later or email us directly.',
    });
  }
});

module.exports = router;
