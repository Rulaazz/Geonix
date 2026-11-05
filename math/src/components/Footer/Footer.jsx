
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

// Replace this URL with the official Geonix Instagram profile.
const INSTAGRAM_URL = 'https://www.instagram.com/';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="geonix-footer">
      <div className="geonix-footer-inner">
        <div className="geonix-footer-brand">
          <Link to="/" className="geonix-footer-logo">
            <img src="/GeonixIcon.png" alt="" />
            <span>
              <strong>GEONIX</strong>
              <small>MATH LEARNING</small>
            </span>
          </Link>

          <p>
            {t(
              'footerDescription',
              'Learn, practice, and improve your math skills with Geonix.'
            )}
          </p>
        </div>

        <div className="geonix-footer-links">
          <h3>{t('quickLinks', 'Quick Links')}</h3>
          <Link to="/">{t('home', 'Home')}</Link>
          <Link to="/contact">{t('contactUs', 'Contact Us')}</Link>
          <Link to="/pricing">{t('ourPackages', 'Our Packages')}</Link>
        </div>

        <div className="geonix-footer-contact">
          <h3>{t('getInTouch', 'Get in Touch')}</h3>

          <a href="mailto:geonix.0509@gmail.com">
            <span aria-hidden="true">✉</span>
            geonix.0509@gmail.com
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Geonix on Instagram"
          >
            <span aria-hidden="true">◎</span>
            Instagram
          </a>

          <Link to="/contact" className="geonix-footer-contact-button">
            {t('sendUsMessage', 'Send Us a Message')} →
          </Link>
        </div>
      </div>

      <div className="geonix-footer-bottom">
        <p>
          © {new Date().getFullYear()} Geonix.{' '}
          {t('allRightsReserved', 'All rights reserved.')}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
