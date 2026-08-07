import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
            {/* Background slider */}
            <div className="hero-slider">
                {SLIDES.map((slide, i) => (
                    <div
                        key={i}
                        className={`hero-slide ${i === current ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.url})` }}
                    />
                ))}
                <div className="hero-overlay" />
            </div>

            {/* Main content */}
            <div className="hero-container">
                <div className="hero-left">
                    <div className="hero-tag">🎵 Live Events & Festivals</div>
                    <h1 className="hero-title">
                        Sounds in the <span className="hero-title-accent">City Festival</span>
                    </h1>
                    <p className="hero-subtitle">
                        Get ready to rock out! This year's lineup is packed with incredible talent
                        from all genres. Don't miss out — get your tickets now!
                    </p>
                    <div className="hero-btns">
                        <Link to="/events" className="hero-btn-primary">Explore Events</Link>
                        <Link to="/register" className="hero-btn-outline">Get Tickets</Link>
                    </div>

                    {/* Stats */}
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-value">50+</span>
                            <span className="hero-stat-label">Festival</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">300+</span>
                            <span className="hero-stat-label">Artist</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">578K</span>
                            <span className="hero-stat-label">Visitors</span>
                        </div>
                    </div>
                </div>
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
