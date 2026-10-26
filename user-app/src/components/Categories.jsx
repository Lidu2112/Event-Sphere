import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

import { apiUrl } from '../api/config';

const API_URL = apiUrl('/api');

const REAL_CATEGORIES = [
    { 
        label: 'Concert & Live Music', 
        subtitle: 'Unforgettable musical nights, live performances, and energetic stage shows captured across our entertainment schedules.',
        image: 'https://i.pinimg.com/1200x/f6/63/a4/f663a4a0de0f2e0f5e680ca70b956fd8.jpg',
        badge: '1 PHOTO',
        color: '#8b5cf6' 
    },
    { 
        label: 'Professional Conferences', 
        subtitle: 'Keynotes, panel discussions, and industry leaders connecting to share insights, strategies, and networking.',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
        badge: '1 PHOTO',
        color: '#0ea5e9' 
    },
    { 
        label: 'Art & Cultural Exhibitions', 
        subtitle: 'Immersive visual showcases, local artist features, and heritage displays open to the public.',
        image: 'https://catbirdinafrica.wordpress.com/wp-content/uploads/2012/11/pb017976.jpg',
        badge: '1 PHOTO',
        color: '#f59e0b' 
    },
    { 
        label: 'Interactive Workshops', 
        subtitle: 'Hands-on skill-building sessions, collaborative team tasks, and expert-led technical training blocks.',
        image: 'https://ehrc.org/wp-content/uploads/2026/06/DSC04821.JPG-1024x577.jpg',
        badge: '1 PHOTO',
        color: '#10b981' 
    },
    { 
        label: 'Festivals & Celebrations', 
        subtitle: 'Vibrant outdoor crowds, music, food stalls, and community-driven cultural festivities.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRklY1vEAk8HjPevgOm4TSNeKn63vJiXIcPR7_JHre7VHQyoWfvQN-xvGTu&s=10',
        badge: '1 PHOTO',
        color: '#ec4899' 
    },
];

export default function Categories() {
    const [categories, setCategories] = useState(REAL_CATEGORIES);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch(`${API_URL}/categories`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const formatted = data.map((item, index) => {
                        const fallback = REAL_CATEGORIES[index % REAL_CATEGORIES.length];
                        return {
                            label: typeof item === 'string' ? item : item.name,
                            subtitle: item.subtitle || fallback.subtitle,
                            image: item.image || item.imageUrl || fallback.image,
                            badge: item.badge || '1 PHOTO',
                            color: item.color || fallback.color
                        };
                    });
                    setCategories(formatted);
                }
            })
            .catch(err => console.log('Using default static categories:', err));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [categories.length]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? categories.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
    };

    const currentCat = categories[currentIndex] || categories[0];

    return (
        <section 
            className="categories-hero-slider" 
            style={{ backgroundImage: `url(${currentCat.image})` }}
        >
            {/* Full section dark gradient overlay */}
            <div className="cat-slider-overlay"></div>

            <div className="cat-container">
                {/* Header Section */}
                <div className="cat-header">
                    <h2 className="cat-section-title">Browse by Category</h2>
                    <Link to="/categories" className="cat-view-all-gallery">
                        View all Category →
                    </Link>
                </div>

                {/* Main Content Area */}
                <div className="cat-slider-content-area">
                    <div className="cat-slider-content">
                        <div className="cat-badge-pill">{currentCat.badge}</div>
                        <h3 className="cat-active-title">{currentCat.label}</h3>
                        <p className="cat-active-subtitle">{currentCat.subtitle}</p>
                        <Link 
                            to={`/events?category=${encodeURIComponent(currentCat.label)}`} 
                            className="cat-explore-btn"
                            style={{ backgroundColor: currentCat.color }}
                        >
                            Explore Events →
                        </Link>
                    </div>

                    {/* Navigation Controls */}
                    <div className="cat-slider-controls">
                        <div className="cat-dots">
                            {categories.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`cat-dot ${idx === currentIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                        <div className="cat-arrows">
                            <button className="cat-arrow-btn" onClick={handlePrev} aria-label="Previous Slide">
                                ←
                            </button>
                            <button className="cat-arrow-btn" onClick={handleNext} aria-label="Next Slide">
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}