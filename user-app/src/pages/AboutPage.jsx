import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import './Page.css';
import './AboutPage.css';

export default function AboutPage() {
    const { lang } = useLang();

    const team = [
        { name: 'Abebe Birru', role: 'CEO & Founder', img: '👨🏾‍💼' },
        { name: 'Selam Tekeste', role: 'Head of Operations', img: '👩🏾‍💼' },
        { name: 'Yonas Bekele', role: 'Lead Developer', img: '👨🏾‍💻' },
        { name: 'Hanor Alemu', role: 'Marketing Director', img: '👩🏾‍🎨' },
    ];

    const values = [
        { 
            imgUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80', 
            title: 'Our Mission', 
            desc: 'Connect event organizers, vendors, and attendees through a seamless, innovative platform.' 
        },
        { 
            imgUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80', 
            title: 'Our Vision', 
            desc: 'To be the leading event platform in Ethiopia and beyond.' 
        },
        { 
            imgUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', 
            title: 'Our Values', 
            desc: 'Transparency, innovation, and Community at our core.' 
        },
    ];

    const serve = [
        { 
            imgUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80', 
            title: 'Event Organizers', 
            desc: 'Create and manage incredible events with ease.' 
        },
        { 
            imgUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80', 
            title: 'Attendees', 
            desc: 'Discover and join events that match your interests.' 
        },
        { 
            imgUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=400&q=80', 
            title: 'Vendors', 
            desc: 'Showcase your services and grow your business.' 
        },
        { 
            imgUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', 
            title: 'Event Staff', 
            desc: 'Plan and coordinate events more efficiently.' 
        },
    ];

    return (
        <div className="about-page-wrapper">
            {/* Animated Hero Section with Background Zoom */}
            <div 
                className="page-hero ap-hero animate-hero-fade"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(30, 15, 28, 0.92) 0%, rgba(30, 15, 28, 0.75) 50%, rgba(30, 15, 28, 0.4) 100%), 
                    url(https://as1.ftcdn.net/v2/jpg/21/20/63/38/1000_F_2120633815_NptYzpAbg6W8CRasm4GxxvUitHqITkGP.jpg)`
                }}
            >
                <div className="ap-hero-content">
                    <div className="ap-hero-text animate-text-slide">
                        <span className="ap-hero-tag">— About EventSphere</span>
                        <h1>Discover. Attend.<br /><span>Experience More.</span></h1>
                        <p>{t(lang, 'ap_subtitle') || 'Your trusted platform for discovering and managing amazing events across Ethiopia.'}</p>
                        <div className="ap-hero-btn-wrap">
                            <Link to="/events" className="btn-primary-orange pulse-btn">
                                Explore Events <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-body">

                {/* Mission / Vision / Values with Staggered Fade-In */}
                <div className="ap-values">
                    {values.map((v, i) => (
                        <div key={i} className={`ap-value-card animate-card-up delay-${i + 1}`}>
                            <div className="ap-value-img-wrap">
                                <img src={v.imgUrl} alt={v.title} className="ap-card-img" />
                            </div>
                            <div className="ap-value-text">
                                <h3>{v.title}</h3>
                                <p>{v.desc}</p>
                            </div>
                            <div className="ap-card-arrow"><ArrowForwardIcon aria-hidden="true" style={{ fontSize: 18 }} /></div>
                        </div>
                    ))}
                </div>

                {/* Who we serve */}
                <div className="ap-serve-section">
                    <div className="section-title-badge animate-fade-in">Who We Serve</div>
                    <p className="ap-section-subtitle animate-fade-in">A platform for everyone who loves events</p>
                    <div className="ap-serve-grid">
                        {serve.map((item, i) => (
                            <div key={i} className={`ap-serve-card animate-card-up delay-${i + 1}`}>
                                <div className="ap-serve-img-wrap">
                                    <img src={item.imgUrl} alt={item.title} className="ap-serve-img" />
                                </div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="ap-team-section">
                    <div className="section-title-badge animate-fade-in">Meet Our Team</div>
                    <p className="ap-section-subtitle animate-fade-in">A passionate team dedicated to making events better</p>
                    <div className="ap-team-grid">
                        {team.map((m, i) => (
                            <div key={i} className={`ap-team-card animate-card-up delay-${i + 1}`}>
                                <div className="ap-team-avatar float-avatar" aria-hidden="true">{m.img}</div>
                                <div className="ap-team-name">{m.name}</div>
                                <div className="ap-team-role">{m.role}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Banner with Subtle Glow Pulse */}
                <div className="ap-cta glow-pulse">
                    <div className="ap-cta-content">
                        <h2>Ready to discover amazing events?</h2>
                        <p>Join thousands of people already using EventSphere.</p>
                        <div className="ap-cta-btns">
                            <Link to="/events" className="btn-orange">Browse Events <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /></Link>
                            <Link to="/register" className="btn-dark-outline">Create Account</Link>
                        </div>
                    </div>
                    <div className="ap-cta-icon-bg rotate-slow"><EventIcon aria-hidden="true" style={{ fontSize: 80 }} /></div>
                </div>

            </div>
        </div>
    );
}