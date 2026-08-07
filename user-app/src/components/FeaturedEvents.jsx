import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FeaturedEvents.css';

const CATEGORY_COLORS = {
    Concert: '#8b5cf6', Music: '#8b5cf6', Conference: '#3b82f6', Business: '#3b82f6',
    Sports: '#10b981', Exhibition: '#f59e0b', Art: '#f59e0b', Workshop: '#06b6d4',
    Festival: '#ec4899', Wedding: '#ec4899', Food: '#f97316', Cultural: '#f97316',
    Networking: '#64748b', Seminar: '#6366f1', Webinar: '#8b5cf6', Event: '#6366f1',
};

export default function FeaturedEvents() {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search fields
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [searchDate, setSearchDate] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/events')
            .then(res => res.json())
            .then(data => {
                const dbEvents = (data.events || [])
                    .filter(e => e.source === 'db')
                    .map(e => ({
                        id: e.id,
                        title: e.title,
                        location: e.location || e.venue || '',
                        date: e.date,
                        price: e.price || (e.ticketPrice === 0 ? 'Free' : `ETB ${Number(e.ticketPrice).toLocaleString()}`),
                        image: e.img || e.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
                        category: e.badge || e.category || 'Event',
                        categoryColor: e.badgeColor || CATEGORY_COLORS[e.badge] || CATEGORY_COLORS[e.category] || '#6366f1',
                    }));
                setAllEvents(dbEvents);
            })
            .catch(() => setAllEvents([]))
            .finally(() => setLoading(false));
    }, []);

    // Derive unique categories for dropdown
    const categories = ['All', ...new Set(allEvents.map(e => e.category).filter(Boolean))];

    // Filter logic
    const filtered = allEvents.filter(e => {
        const name = searchName.toLowerCase();
        const city = searchCity.toLowerCase();
        const cat = searchCategory;
        const date = searchDate;

        return (
            (!name || e.title.toLowerCase().includes(name)) &&
            (!cat || cat === 'All' || e.category === cat) &&
            (!city || e.location.toLowerCase().includes(city)) &&
            (!date || e.date.includes(date))
        );
    });

    return (
       <section className="featured-events" id="events">
    <div className="featured-events-container">

        {/* Combined Header & Search Bar Row */}
        <div className="featured-header">
            <div className="featured-header-left">
                <h2 className="featured-title">Featured Events</h2>
                {/* <p className="featured-subtitle">Discover the most popular events in your city</p> */}
            </div>

            {/* Embedded Search bar */}
          <div className="featured-search-bar">
    <div className="fsb-field">
        <i className="fas fa-search" style={{ fontSize: '18px' }}></i>
        <input
            type="text"
            placeholder="Search name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
        />
    </div>
    {/* rest of your code */}

                <div className="fsb-divider" />
                <div className="fsb-field">
                    {/* <span className="fsb-icon"></span> */}
                    <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                        {categories.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                    </select>
                </div>
                <div className="fsb-divider" />
                <div className="fsb-field">
                    {/* <span className="fsb-icon">📍</span> */}
                    <input
                        type="text"
                        placeholder="City..."
                        value={searchCity}
                        onChange={e => setSearchCity(e.target.value)}
                    />
                </div>
                <div className="fsb-divider" />
                <div className="fsb-field">
                    {/* <span className="fsb-icon">📅</span> */}
                    <input
                        type="date"
                        value={searchDate}
                        onChange={e => setSearchDate(e.target.value)}
                    />
                </div>
                <button className="fsb-btn" onClick={() => { setSearchName(''); setSearchCategory(''); setSearchCity(''); setSearchDate(''); }}>
                    Clear
                </button>
            </div>

            <Link to="/events" className="featured-view-all">
                View All Events →
            </Link>
        </div>

                {/* Search bar */}
                {/* <div className="featured-search-bar">
                    <div className="fsb-field">
                        <span className="fsb-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                        />
                    </div>
                    <div className="fsb-divider" />
                    <div className="fsb-field">
                        <span className="fsb-icon">🏷️</span>
                        <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="fsb-divider" />
                    <div className="fsb-field">
                        <span className="fsb-icon">📍</span>
                        <input
                            type="text"
                            placeholder="City..."
                            value={searchCity}
                            onChange={e => setSearchCity(e.target.value)}
                        />
                    </div>
                    <div className="fsb-divider" />
                    <div className="fsb-field">
                        <span className="fsb-icon">📅</span>
                        <input
                            type="date"
                            value={searchDate}
                            onChange={e => setSearchDate(e.target.value)}
                        />
                    </div>
                    <button className="fsb-btn" onClick={() => { setSearchName(''); setSearchCategory(''); setSearchCity(''); setSearchDate(''); }}>
                        Clear
                    </button>
                </div> */}

                {loading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                        Loading events...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🎪</div>
                        <p style={{ margin: 0, fontSize: 15 }}>
                            {allEvents.length === 0 ? 'No events yet. Check back soon!' : 'No events match your search.'}
                        </p>
                    </div>
                ) : (
                    <div className="featured-grid">
                        {filtered.map(event => (
                            <Link
                                to={`/events/${event.id}`}
                                className="featured-card-link"
                                key={event.id}
                            >
                                <div className="featured-card">
                                    <div className="featured-card-image">
                                        <img src={event.image} alt={event.title} loading="lazy" />
                                        <span
                                            className="featured-card-category"
                                            style={{ background: event.categoryColor }}
                                        >
                                            {event.category}
                                        </span>
                                    </div>
                                    <div className="featured-card-content">
                                        <h3 className="featured-card-title">{event.title}</h3>
                                        <div className="featured-card-details">
                                            <div className="featured-card-location">
                                                {/* <span className="featured-card-icon">📍</span> */}
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="featured-card-date">
                                                {/* <span className="featured-card-icon">📅</span> */}
                                                <span>{event.date}</span>
                                            </div>
                                        </div>
                                        <div className="featured-card-footer">
                                            <span className="featured-card-price">{event.price}</span>
                                            <span className="featured-card-arrow">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
