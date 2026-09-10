import React from 'react';
import './Header.css';
import logo from '../../pages/Home/GeonixIcon.png';

function Header() {
  return (
    <header className="header">
      <a href="/" className="header-logo">
        <img src={logo} alt="Geonix" />
        <span>Geonix</span>
      </a>

      <nav className="header-nav">
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/practice">Practice</a>
      </nav>
    </header>
  );
}

export default Header;