import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

import { apiUrl } from '../api/config';

const API_URL = apiUrl('/api');

// Static fallbacks matching image two with custom styling
const REAL_CATEGORIES = [
    { label: 'Concert', icon: '🎤', color: '#8b5cf6' },
    { label: 'Conference', icon: '💼', color: '#0ea5e9' },
    { label: 'Exhibition', icon: '🖼️', color: '#f59e0b' },
    { label: 'Workshop', icon: '🛠️', color: '#10b981' },
    { label: 'Seminar', icon: '📚', color: '#6366f1' },
    { label: 'Festival', icon: '🎉', color: '#ec4899' },
    { label: 'Networking', icon: '🤝', color: '#3b82f6' },
    { label: 'Webinar', icon: '💻', color: '#06b6d4' },
    { label: 'Sports', icon: '⚽', color: '#10b981' },
    { label: 'Cultural', icon: '🏛️', color: '#f97316' },
    { label: 'Food', icon: '🍔', color: '#ef4444' },
];

export default function Categories() {
    const [categories, setCategories] = useState(REAL_CATEGORIES);

    useEffect(() => {
        // Fetch real dynamic categories from database if backend endpoint exists
        fetch(`${API_URL}/categories`)
            ? fetch(`${API_URL}/categories`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        // Map database response to match the display structure
                        const formatted = data.map((item, index) => ({
                            label: typeof item === 'string' ? item : item.name,
                            icon: item.icon || REAL_CATEGORIES[index % REAL_CATEGORIES.length].icon,
                            color: item.color || REAL_CATEGORIES[index % REAL_CATEGORIES.length].color
                        }));
                        setCategories(formatted);
                    }
                })
                .catch(err => console.log('Using default static categories:', err))
            : null;
    }, []);

    // Duplicate array to ensure infinite loop visual continuity
    const displayCategories = [...categories, ...categories];

    return (
        <section className="categories">
            <div className="cat-container">
                <div className="cat-header">
                    <h2 className="cat-title">Browse by Category</h2>
                    <Link to="/categories" className="cat-view-all">View All →</Link>
                </div>
                
                {/* Scroll Wrapper */}
                <div className="cat-scroll-wrapper">
                    <div className="cat-track">
                        {displayCategories.map((cat, i) => (
                            <Link
                                key={i}
                                to={`/events?category=${encodeURIComponent(cat.label)}`}
                                className="cat-card"
                                style={{ borderTopColor: cat.color }}
                            >
                                <div className="cat-icon" style={{ background: cat.color + '20', color: cat.color }}>
                                    {cat.icon}
                                </div>
                                <span className="cat-label">{cat.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}