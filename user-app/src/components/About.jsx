import React from 'react';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import ExploreIcon from '@mui/icons-material/Explore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EventIcon from '@mui/icons-material/Event';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './About.css';

export default function About() {
  const { lang } = useLang();

  const features = [
    {
      num: '1',
      title: 'Event Discovery',
      desc: 'Explore and discover exciting events across different categories, locations, and interests.',
      icon: ExploreIcon
    },
    {
      num: '2',
      title: 'Easy Ticket Booking',
      desc: 'Purchase event tickets securely and conveniently through a simple online booking process.',
      icon: ConfirmationNumberIcon
    },
    {
      num: '3',
      title: 'Vendor Marketplace',
      desc: 'Connect event organizers with trusted vendors and service providers for successful events.',
      icon: StorefrontIcon
    },
    {
      num: '4',
      title: 'Smart Event Management',
      desc: 'Manage events, staff, payments, and attendee check-ins efficiently from one platform.',
      icon: TaskAltIcon
    }
  ];

  return (
    <section className="about" id="about">
      <div className="about-glow about-glow-left" />
      <div className="about-glow about-glow-right" />

      <div className="about-card-wrap">
        <div className="about-card-inner">
          
          {/* Left Animated Large Rectangular Image Column */}
          <div className="about-image-col">
            <div className="about-main-img-wrap float-animated">
              <div className="about-floating-brand">
                <EventIcon className="about-brand-icon" aria-hidden="true" />
                <span className="about-brand-text">EventSphere</span>
              </div>
              
              <img
                src="https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg"
                alt="Event Crowd"
                className="about-card-img"
              />
            </div>
          </div>

          {/* Right Content Column */}
          <div className="about-text-col fade-in-animated">
            <span className="about-tag">About EventSphere</span>
            <h2 className="about-title">
              Connecting People, Creating <span className="about-title-accent">Unforgettable Events</span>
            </h2>
            
            <p className="about-body">
              EventSphere is an all-in-one event management and ticketing platform designed to simplify the way events are discovered, organized, and experienced. It connects event organizers, vendors, attendees, and staff in one seamless platform.
            </p>

            {/* "What Makes EventSphere Special?" Heading */}
            <h3 className="about-features-heading">
              <BoltIcon className="heading-icon" aria-hidden="true" />
              What Makes EventSphere Special?
            </h3>

            {/* Items 1, 2, 3, 4 */}
            <div className="about-features-list">
              {features.map((item) => (
                <div className="about-feature-item" key={item.num}>
                  <div className="about-feature-num-badge">
                    <span>{item.num}</span>
                  </div>
                  <div className="about-feature-content">
                    <h4 className="about-feature-title">
                      <item.icon className="title-icon" aria-hidden="true" />
                      {item.title}
                    </h4>
                    <p className="about-feature-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="/about" className="about-btn">
              <span>Read more about who we are</span>
              <span className="about-btn-arrow"><ArrowForwardIcon aria-hidden="true" /></span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}