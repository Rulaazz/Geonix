
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import i18n from '../../i18n';
import { useUser } from '../UserContext/UserContext';
import './Header.css';

const supportedLanguages = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'he', nativeLabel: 'עברית' },
  { code: 'ar', nativeLabel: 'العربية' },
];

function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isInstructor = user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';

  const currentLanguage = supportedLanguages.some(
    (language) => language.code === i18n.resolvedLanguage
  )
    ? i18n.resolvedLanguage
    : 'en';

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const changeLanguage = async (language) => {
    if (!supportedLanguages.some((item) => item.code === language)) {
      return;
    }

    closeMenus();
    await i18n.changeLanguage(language);
  };

  const handleLogout = async () => {
    closeMenus();

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = () => {
    const name = user?.name || user?.email || 'G';
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length > 1) {
      return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  };

  const navClass = ({ isActive }) =>
    `geonix-nav-link${isActive ? ' active' : ''}`;

  const mobileNavClass = ({ isActive }) =>
    `mobile-nav-link${isActive ? ' active' : ''}`;

  const renderAvatar = (className) => (
    <div className={className}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || t('profile', 'Profile')}
        />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );

  const renderLanguageSelector = (className = '') => (
    <div className={`language-selector ${className}`}>
      <label htmlFor={`geonix-language-${className || 'header'}`}>
        <span aria-hidden="true">🌐</span>
        <span>{t('language', 'Language')}</span>
      </label>

      <select
        id={`geonix-language-${className || 'header'}`}
        value={currentLanguage}
        onChange={(event) => changeLanguage(event.target.value)}
        aria-label={t('language', 'Language')}
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );

  const renderAccountLinks = (mobile = false) => {
    const Item = mobile ? NavLink : Link;
    const itemClass = mobile ? mobileNavClass : 'dropdown-item';

    return (
      <>
        <Item
          to="/profile"
          className={itemClass}
          onClick={closeMenus}
        >
          <span className={mobile ? 'mobile-link-icon' : 'dropdown-icon'}>
            👤
          </span>
          {t('profile', 'My Profile')}
        </Item>

        <Item
          to="/score"
          className={itemClass}
          onClick={closeMenus}
        >
          <span className={mobile ? 'mobile-link-icon' : 'dropdown-icon'}>
            📊
          </span>
          {t('myProgress', 'My Progress')}
        </Item>

        <Item
          to="/my-payments"
          className={itemClass}
          onClick={closeMenus}
        >
          <span className={mobile ? 'mobile-link-icon' : 'dropdown-icon'}>
            🧾
          </span>
          {t('myPayments', 'My Payments')}
        </Item>

        {isInstructor && (
          <>
            <Item
              to="/instructor-dashboard"
              className={itemClass}
              onClick={closeMenus}
            >
              <span className={mobile ? 'mobile-link-icon' : 'dropdown-icon'}>
                🎓
              </span>
              {t('instructorDashboard', 'Instructor Dashboard')}
            </Item>

            <Item
              to="/instructor-setup"
              className={itemClass}
              onClick={closeMenus}
            >
              <span className={mobile ? 'mobile-link-icon' : 'dropdown-icon'}>
                ⚙️
              </span>
              {t('instructorSetup', 'Instructor Setup')}
            </Item>
          </>
        )}

        {isAdmin && (
          <Item
            to="/admin"
            className={itemClass}
            onClick={closeMenus}
          >
            <span className={mobile ? 'mobile-link-icon' : 'dropdown-icon'}>
              🛡️
            </span>
            {t('admin', 'Admin')}
          </Item>
        )}
      </>
    );
  };

  const renderLearningLinks = (mobile = false) => {
    const itemClass = mobile ? mobileNavClass : navClass;
    const closeProps = mobile ? { onClick: closeMenus } : {};

    return (
      <>
        <NavLink to="/dashboard" end className={itemClass} {...closeProps}>
          {mobile && <span className="mobile-link-icon">🏠</span>}
          {t('dashboard', 'Dashboard')}
        </NavLink>

        {!isInstructor && !isAdmin && (
          <NavLink to="/instructors" className={itemClass} {...closeProps}>
            {mobile && <span className="mobile-link-icon">🎓</span>}
            {t('bookLesson', 'Book a Lesson')}
          </NavLink>
        )}

        <NavLink to="/my-lessons" className={itemClass} {...closeProps}>
          {mobile && <span className="mobile-link-icon">📅</span>}
          {t('myLessons', 'My Lessons')}
        </NavLink>

        <NavLink to="/practice" className={itemClass} {...closeProps}>
          {mobile && <span className="mobile-link-icon">🧮</span>}
          {t('practice', 'Practice')}
        </NavLink>

        <NavLink to="/video-lessons" className={itemClass} {...closeProps}>
          {mobile && <span className="mobile-link-icon">🎥</span>}
          {t('videoLessons', 'Video Lessons')}
        </NavLink>

        <NavLink to="/pricing" className={itemClass} {...closeProps}>
          {mobile && <span className="mobile-link-icon">🏷️</span>}
          {t('ourPackages', 'Our Packages')}
        </NavLink>

        <NavLink to="/contact" className={itemClass} {...closeProps}>
          {mobile && <span className="mobile-link-icon">✉️</span>}
          {t('contactUs', 'Contact Us')}
        </NavLink>
      </>
    );
  };

  return (
    <header className="geonix-header">
      <div className="geonix-header-inner">
        <Link
          to="/"
          className="geonix-brand"
          aria-label="Geonix home"
          onClick={closeMenus}
        >
          <img
            src="/GeonixIcon.png"
            alt=""
            className="geonix-brand-logo"
          />

          <span className="geonix-brand-text">
            <span className="geonix-brand-name">GEONIX</span>
            <span className="geonix-brand-subtitle">MATH LEARNING</span>
          </span>
        </Link>

        {user && (
          <nav className="geonix-desktop-nav" aria-label="Main navigation">
            {renderLearningLinks(false)}
          </nav>
        )}

        <div className="geonix-header-actions">
          <div className="desktop-language">
            {renderLanguageSelector('')}
          </div>

          {user ? (
            <div className="geonix-profile-wrapper" ref={profileRef}>
              <button
                type="button"
                className="geonix-profile-button"
                onClick={() => {
                  setProfileMenuOpen((open) => !open);
                  setMobileMenuOpen(false);
                }}
                aria-expanded={profileMenuOpen}
                aria-label={t('openProfileMenu', 'Open profile menu')}
              >
                {renderAvatar('geonix-avatar')}

                <span className="geonix-profile-name">
                  <span className="profile-name">
                    {user.name || 'User'}
                  </span>
                  <span className="profile-role">
                    {isInstructor
                      ? t('instructor', 'Instructor')
                      : isAdmin
                        ? t('admin', 'Admin')
                        : t('student', 'Student')}
                  </span>
                </span>

                <span
                  className={`profile-chevron${profileMenuOpen ? ' open' : ''}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {profileMenuOpen && (
                <div className="geonix-profile-dropdown">
                  <div className="dropdown-user-info">
                    {renderAvatar('dropdown-avatar')}

                    <div className="dropdown-user-details">
                      <strong>{user.name || 'User'}</strong>
                      <span>{user.email || ''}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />
                  {renderAccountLinks(false)}
                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">↪</span>
                    {t('logout', 'Log out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="geonix-auth-buttons">
              <Link
                to="/login"
                className="geonix-login-button"
                onClick={closeMenus}
              >
                {t('login', 'Log in')}
              </Link>

              <Link
                to="/signup"
                className="geonix-signup-button"
                onClick={closeMenus}
              >
                {t('signup', 'Sign up')}
              </Link>
            </div>
          )}

          <div ref={mobileMenuRef}>
            <button
              type="button"
              className={`geonix-mobile-menu-button${mobileMenuOpen ? ' open' : ''}`}
              onClick={() => {
                setMobileMenuOpen((open) => !open);
                setProfileMenuOpen(false);
              }}
              aria-label={
                mobileMenuOpen
                  ? t('closeMenu', 'Close navigation menu')
                  : t('openMenu', 'Open navigation menu')
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="geonix-mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="geonix-mobile-menu" id="geonix-mobile-menu">
          <nav className="geonix-mobile-nav" aria-label="Mobile navigation">
            {user ? (
              <>
                <p className="mobile-menu-heading">
                  {t('learning', 'LEARNING')}
                </p>

                {renderLearningLinks(true)}

                <div className="mobile-language-container">
                  {renderLanguageSelector('mobile-language')}
                </div>

                <p className="mobile-menu-heading">
                  {t('yourAccount', 'YOUR ACCOUNT')}
                </p>

                {renderAccountLinks(true)}

                <button
                  type="button"
                  className="mobile-nav-link mobile-logout"
                  onClick={handleLogout}
                >
                  <span className="mobile-link-icon">↪</span>
                  {t('logout', 'Log out')}
                </button>
              </>
            ) : (
              <>
                <p className="mobile-menu-heading">
                  {t('welcome', 'WELCOME')}
                </p>

                {renderLanguageSelector('mobile-language')}

                <NavLink
                  to="/contact"
                  className={mobileNavClass}
                  onClick={closeMenus}
                >
                  <span className="mobile-link-icon">✉️</span>
                  {t('contactUs', 'Contact Us')}
                </NavLink>

                <NavLink
                  to="/login"
                  className={mobileNavClass}
                  onClick={closeMenus}
                >
                  <span className="mobile-link-icon">🔐</span>
                  {t('login', 'Log in')}
                </NavLink>

                <NavLink
                  to="/signup"
                  className={mobileNavClass}
                  onClick={closeMenus}
                >
                  <span className="mobile-link-icon">✨</span>
                  {t('signup', 'Sign up')}
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
