import React from 'react';
import { Link } from 'react-router-dom';
import './Page.css';
import './AboutPage.css';

export default function AboutPage() {
    const stats = [
        { value: '4,821+', label: 'Registered Users', icon: '👥' },
        { value: '138', label: 'Active Events', icon: '🎪' },
        { value: '28K+', label: 'Tickets Sold', icon: '🎟️' },
        { value: '92', label: 'Verified Vendors', icon: '🏪' },
    ];

    const team = [
        { name: 'Abebe Girma', role: 'CEO & Founder', img: '👨‍💼' },
        { name: 'Selam Tadesse', role: 'Head of Operations', img: '👩‍💼' },
        { name: 'Yonas Bekele', role: 'Lead Developer', img: '👨‍💻' },
        { name: 'Meron Alemu', role: 'Marketing Director', img: '👩‍🎨' },
    ];

    const values = [
        { icon: '🎯', title: 'Our Mission', desc: 'Connect event organizers, vendors, attendees, and staff in one seamless platform, making event discovery effortless.' },
        { icon: '👁️', title: 'Our Vision', desc: 'To become the most trusted event management platform across East Africa and beyond.' },
        { icon: '💎', title: 'Our Values', desc: 'Transparency, innovation, community and excellence drive everything we build and every decision we make.' },
    ];

    return (
        <div>
            <div className="page-hero ap-hero">
                <div className="page-hero-inner">
                    <div className="page-breadcrumb">
                        <Link to="/">Home</Link> / About
                    </div>
                    <h1>About <span>EventSphere</span></h1>
                    <p>Your trusted platform for discovering and managing amazing events across Ethiopia</p>
                </div>
            </div>

            <div className="page-body">

                {/* Stats */}
                <div className="ap-stats">
                    {stats.map((s, i) => (
                        <div key={i} className="ap-stat">
                            <div className="ap-stat-icon">{s.icon}</div>
                            <div className="ap-stat-val">{s.value}</div>
                            <div className="ap-stat-lbl">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Mission / Vision / Values */}
                <div className="ap-values">
                    {values.map((v, i) => (
                        <div key={i} className="ap-value-card">
                            <div className="ap-value-icon">{v.icon}</div>
                            <h3>{v.title}</h3>
                            <p>{v.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Who we serve */}
                <div className="ap-serve-section">
                    <h2 className="ap-section-title">Who We Serve</h2>
                    <div className="ap-serve-grid">
                        {[
                            { icon: '🎪', title: 'Event Organizers', desc: 'Create, promote, and manage events with powerful tools and real-time analytics.' },
                            { icon: '🎟️', title: 'Attendees', desc: 'Browse, book, and experience incredible events. Get digital tickets on your phone.' },
                            { icon: '🏪', title: 'Vendors', desc: 'Showcase your services, receive bookings, and grow your event business.' },
                            { icon: '👷', title: 'Event Staff', desc: 'Scan tickets, manage check-ins, and ensure smooth event day operations.' },
                        ].map((item, i) => (
                            <div key={i} className="ap-serve-card">
                                <div className="ap-serve-icon">{item.icon}</div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="ap-team-section">
                    <h2 className="ap-section-title">Meet Our Team</h2>
                    <div className="ap-team-grid">
                        {team.map((m, i) => (
                            <div key={i} className="ap-team-card">
                                <div className="ap-team-avatar">{m.img}</div>
                                <div className="ap-team-name">{m.name}</div>
                                <div className="ap-team-role">{m.role}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="ap-cta">
                    <h2>Ready to discover amazing events?</h2>
                    <p>Join thousands of people already using EventSphere.</p>
                    <div className="ap-cta-btns">
                        <Link to="/events" className="btn-purple">🎪 Browse Events</Link>
                        <Link to="/register" className="btn-outline">📝 Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}