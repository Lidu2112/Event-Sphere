import React from 'react';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import './About.css';

export default function About() {
  const { lang } = useLang();

  const stats = [
    { icon: '👥', value: '4,821+', labelKey: 'about_stat_users', descKey: 'about_stat_users_desc' },
    { icon: '🎪', value: '138+', labelKey: 'about_stat_events', descKey: 'about_stat_events_desc' },
    { icon: '🎟️', value: '28K+', labelKey: 'about_stat_tickets', descKey: 'about_stat_tickets_desc' },
    { icon: '🏪', value: '92', labelKey: 'about_stat_vendors', descKey: 'about_stat_vendors_desc' },
  ];

  return (
    <section className="about" id="about">
      <div className="about-glow about-glow-left" />
      <div className="about-glow about-glow-right" />

      <div className="about-card-wrap">
        <div className="about-card-inner">
          <div className="about-image-col">
            <img
              src="https://www.thereporterethiopia.com/wp-content/uploads/2018/05/Concerts.jpg"
              alt="EventSphere live concert"
              className="about-card-img"
            />
          </div>
          <div className="about-text-col">
            <h2 className="about-title">{t(lang, 'about_title')}</h2>
            <p className="about-body">{t(lang, 'about_body')}</p>
            <p className="about-highlight-text">{t(lang, 'about_highlight')}</p>
            <a href="#events" className="about-btn">
              {t(lang, 'about_btn')} <span className="about-btn-arrow">→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="about-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="about-stat-card">
            <div className="about-stat-icon-wrap">
              <span className="about-stat-icon">{stat.icon}</span>
            </div>
            <div className="about-stat-value">{stat.value}</div>
            <div className="about-stat-label">{t(lang, stat.labelKey)}</div>
            <p className="about-stat-desc">{t(lang, stat.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
