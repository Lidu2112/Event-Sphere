import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import './Hero.css';

const SLIDES = [
    {
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6czl17LPgK5DISLRytBEGXJ1oS6Y660eKwO2fiYDzzSjJW5Dg8I_iYBMQ&s=10',
        alt: 'Live concert performers on stage',
    },
    {
        url: 'https://www.shutterstock.com/image-photo/megab-ethiopia-22-august-2025-600w-2705835595.jpg',
        alt: 'Music festival crowd',
    },
    {
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUdW-UVOrZfqi1OwbGOjPkLe3HA3NaKyacBmFm2wB1u2op_TlMnqZ7Z1I&s=10',
        alt: 'Festival lights and crowd',
    },
];

export default function Hero() {
    const { lang } = useLang();
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
    const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

    useEffect(() => {
        if (paused) return;
        const timer = setTimeout(next, 5000);
        return () => clearTimeout(timer);
    }, [current, paused, next]);

    return (
        <section className="hero" id="home">
            {/* Background Video */}
            <div className="hero-video-bg">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="hero-bg-video"
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                    {/* Fallback: image slider if video doesn't load */}
                    {SLIDES.map((slide, i) => (
                        <div
                            key={i}
                            className={`hero-slide ${i === current ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${slide.url})` }}
                        />
                    ))}
                </video>
                <div className="hero-overlay" />
            </div>

            {/* Main content split layout */}
            <div className="hero-container">
                <div className="hero-left">
                    <div className="hero-tag">{t(lang, 'hero_tag')}</div>
                    <h1 className="hero-title">
                        {t(lang, 'hero_title_1')} <span className="hero-title-accent">{t(lang, 'hero_title_accent')}</span><br />
                        <span className="hero-sp">{t(lang, 'hero_title_2')}</span>
                    </h1>
                    <p className="hero-subtitle">{t(lang, 'hero_subtitle')}</p>
                    <div className="hero-btns">
                        <Link to="/events" className="hero-btn-primary">{t(lang, 'hero_btn_explore')}</Link>
                        <Link to="/register" className="hero-btn-outline">{t(lang, 'hero_btn_tickets')}</Link>
                    </div>

                    {/* Stats */}
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-value">50+</span>
                            <span className="hero-stat-label">{t(lang, 'hero_stat_festival')}</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">300+</span>
                            <span className="hero-stat-label">{t(lang, 'hero_stat_artist')}</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">578K</span>
                            <span className="hero-stat-label">{t(lang, 'hero_stat_visitors')}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-right-card" />
            </div>

            {/* Slider controls */}
            <button className="slider-control slider-arrow left" onClick={prev} aria-label="Previous">‹</button>
            <button className="slider-control slider-arrow right" onClick={next} aria-label="Next">›</button>

            <div className="slider-dots">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        className={`slider-dot ${i === current ? 'active' : ''}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}