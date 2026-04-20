import React from 'react';
import './MetaZone.css';

export function MetaZone() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="drawer-meta-zone" aria-label="Portfolio metadata">
      <div className="drawer-meta-left">
        <span>&copy; {currentYear}</span>
        <span>TA</span>
        <span>RSS</span>
      </div>
      <div className="drawer-meta-right">
        <p>Portfolio v2 - <span className="meta-blue">Bucharest, Romania</span></p>
        <span>Build: {import.meta.env.VITE_BUILD_INFO.buildTime} ({import.meta.env.VITE_BUILD_INFO.hash.toLowerCase()})</span>
        <span>Content: {import.meta.env.VITE_BUILD_INFO.contentDate}</span>
      </div>
    </footer>
  );
}
