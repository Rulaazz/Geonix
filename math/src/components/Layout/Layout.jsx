
import React from 'react';

import Header from '../Header/Header';
import Footer from '../Footer/Footer';

import './Layout.css';

function Layout({ children }) {
  return (
    <div className="geonix-layout">
      <Header />

      <main className="geonix-main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
