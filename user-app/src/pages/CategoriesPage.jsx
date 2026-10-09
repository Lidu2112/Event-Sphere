import { useState, useEffect } from 'react';
import { apiUrl } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import './Page.css';
import './EventsPage.css';
import './CategoriesPage.css';

// Real Event Categories matching the user-facing categories
const STATIC_CATEGORIES = [
    { icon: '🎤', label: 'Concert', color: '#8b5cf6' },
    { icon: '💼', label: 'Conference', color: '#0ea5e9' },
    { icon: '🖼️', label: 'Exhibition', color: '#f59e0b' },
    { icon: '🛠️', label: 'Workshop', color: '#10b981' },
    { icon: '📚', label: 'Seminar', color: '#6366f1' },
    { icon: '🎉', label: 'Festival', color: '#ec4899' },
    { icon: '🤝', label: 'Networking', color: '#3b82f6' },
    { icon: '💻', label: 'Webinar', color: '#06b6d4' },
    { icon: '⚽', label: 'Sports', color: '#10b981' },
    { icon: '🏛️', label: 'Cultural', color: '#f97316' },
    { icon: '🍔', label: 'Food', color: '#ef4444' },
];

export default function CategoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Support reading both 'category' and 'filter' query parameters from URL
    const initialCategory = searchParams.get('category') || searchParams.get('filter') || null;
    const [selected, setSelected] = useState(initialCategory);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Synchronize state if URL query parameter changes
    useEffect(() => {
        const catParam = searchParams.get('category') || searchParams.get('filter');
        if (catParam) {
            setSelected(catParam);
        }
    }, [searchParams]);

    // Fetch events from DB whenever a category is selected
    useEffect(() => {
        if (!selected) { 
            setEvents([]); 
            return; 
        }

        setLoading(true);
        const params = new URLSearchParams({ category: selected });
        
        fetch(apiUrl(`/api/events?${params}`))
            .then(r => r.json())
            .then(data => setEvents((data.events || []).filter(e => e.source === 'db')))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, [selected]);

    const handleSelectCategory = (categoryLabel) => {
        if (selected === categoryLabel) {
            setSelected(null);
            setSearchParams({});
        } else {
            setSelected(categoryLabel);
            setSearchParams({ category: categoryLabel });
        }
    };

    const activeColor = selected
        ? (STATIC_CATEGORIES.find(c => c.label.toLowerCase() === selected.toLowerCase())?.color || '#6366f1')
        : '#6366f1';

    return (
        <div>
            <div className="page-hero">
                <div className="page-hero-inner">
                    <div className="page-breadcrumb">
                        <Link to="/">Home</Link> / Categories
                    </div>
                    <h1>Browse by Category</h1>
                    <p>Explore events across all categories</p>
                </div>
            </div>

            <div className="page-body">
                {/* Category selection grid */}
                <div className="cp-grid">
                    {STATIC_CATEGORIES.map((cat, i) => {
                        const isSelected = selected?.toLowerCase() === cat.label.toLowerCase();
                        return (
                            <button
                                key={i}
                                className={`cp-card ${isSelected ? 'active' : ''}`}
                                style={isSelected
                                    ? { background: cat.color, borderColor: cat.color }
                                    : { borderTopColor: cat.color }}
                                onClick={() => handleSelectCategory(cat.label)}
                            >
                                <div className="cp-icon" style={
                                    isSelected
                                        ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                                        : { background: cat.color + '20', color: cat.color }
                                }>
                                    {cat.icon}
                                </div>
                                <div className={`cp-label ${isSelected ? 'cp-label-white' : ''}`}>
                                    {cat.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Events section — only shows when a category is selected */}
                {selected && (
                    <>
                        <div className="cp-events-header">
                            <h2 style={{ color: activeColor }}>{selected} Events</h2>
                            <button className="btn-outline" onClick={() => handleSelectCategory(selected)}>
                                Clear Filter
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                                Loading {selected} events...
                            </div>
                        ) : events.length === 0 ? (
                            <div className="ep-empty">
                                <div>📭</div>
                                <p>No {selected} events published yet.</p>
                            </div>
                        ) : (
                            <div className="pg-grid-4">
                                {events.map(event => (
                                    <Link key={event.id || event._id} to={`/events/${event.id || event._id}`} className="ep-card">
                                        <div className="ep-img-wrap">
                                            <img src={event.img || event.banner} alt={event.title} loading="lazy" />
                                            <span className="ep-badge" style={{ background: event.badgeColor || activeColor }}>
                                                {event.badge || event.category}
                                            </span>
                                        </div>
                                        <div className="ep-content">
                                            <h3>{event.title}</h3>
                                            <div className="ep-meta">
                                                <span>📍 {event.location}</span>
                                                <span>📅 {event.date}</span>
                                            </div>
                                            <div className="ep-footer">
                                                <span className="ep-price">{event.price}</span>
                                                <span className="ep-arrow">→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
