import React from 'react';
import './About.css';

export default function About() {
  const stats = [
    { icon: '👥', value: '4,821+', label: 'Registered Users' },
    { icon: '🎪', value: '138', label: 'Active Events' },
    { icon: '🎟️', value: '28K+', label: 'Tickets Sold' },
    { icon: '🏪', value: '92', label: 'Verified Vendors' },
  ];

  return (
    <section className="about" id="about">
      {/* Glow Effects */}
      <div className="about-glow about-glow-left" />
      <div className="about-glow about-glow-right" />

      <div className="about-container">
        {/* Left Column */}
        <div className="about-left">
          <span className="about-tag">
            <span className="about-tag-dot" /> Our Story
          </span>

          <h2 className="about-title">
            About <span className="about-title-accent">EventSphere</span>
          </h2>

          <p className="about-body">
            EventSphere was created with a single vision:{' '}
            <strong>turning ordinary gatherings into extraordinary experiences.</strong>
          </p>

          <p className="about-body">
            We bridge event organizers, premium vendors, eager attendees, and key staff across Ethiopia onto a unified, high-performance platform — making event booking and operational management seamless.
          </p>

          <a href="#events" className="about-btn">
            <span className="about-btn-icon">♥</span> Explore Events
          </a>
        </div>

        {/* Right Column */}
        <div className="about-right">
          <div className="about-img-wrap">
            <img
              src="https://www.thereporterethiopia.com/wp-content/uploads/2018/05/Concerts.jpg"
              alt="EventSphere live concert"
              className="about-img"
            />
            
            {/* Overlay Badge */}
            <div className="about-floating-badge">
              <span className="badge-icon">⭐</span>
              <div className="badge-content">
                <span className="badge-number">#1</span>
                <span className="badge-label">Event Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Card-Style Stats Grid */}
      <div className="about-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="about-stat-card">
            <div className="about-stat-icon">{stat.icon}</div>
            <div className="about-stat-value">{stat.value}</div>
            <div className="about-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}