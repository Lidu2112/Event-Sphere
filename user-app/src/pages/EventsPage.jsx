import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../api/events';
import './EventsPage.css';

export default function EventsPage() {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchEvents()
            .then(data => {
                setAllEvents(data.filter(e => e.source === 'db'));
            })
            .catch(() => setAllEvents([]))
            .finally(() => setLoading(false));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const cats = ['All Categories', ...new Set(allEvents.map(e => e.badge).filter(Boolean))];

    const filtered = allEvents.filter(e => {
        const matchSearch = !search ||
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            (e.location || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All Categories' || e.badge === category;
        return matchSearch && matchCat;
    });

    const handleClear = () => {
        setSearch('');
        setCategory('All Categories');
    };

    return (
        <div className="ep-page-wrapper">
            <header className="page-hero">
                <div className="page-hero-inner">
                    <nav className="page-breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span className="current">Events</span>
                    </nav>
                    <h1>Explore Events</h1>
                    <p>Find upcoming live shows, tech conferences, workshops, and meetups near you.</p>
                </div>
            </header>

            <main className="page-body">
                {/* Modern Floating Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-input-wrap search-wrap">
                        <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by title or location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="clear-input-btn" onClick={() => setSearch('')}>×</button>
                        )}
                    </div>

                    <div className="filter-divider" />

                    {/* Custom Dropdown */}
                    <div className="filter-input-wrap custom-select" ref={dropdownRef}>
                        <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        <button 
                            type="button" 
                            className="select-trigger" 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>{category}</span>
                            <svg className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <ul className="select-dropdown">
                                {cats.map(c => (
                                    <li 
                                        key={c} 
                                        className={category === c ? 'active' : ''}
                                        onClick={() => {
                                            setCategory(c);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {(search || category !== 'All Categories') && (
                        <button className="btn-reset" onClick={handleClear}>
                            Reset
                        </button>
                    )}
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="ep-loading-state">
                        <div className="spinner"></div>
                        <p>Loading curated events...</p>
                    </div>
                ) : (
                    <>
                        <div className="ep-header-meta">
                            <h2>Showing {filtered.length} {filtered.length === 1 ? 'Event' : 'Events'}</h2>
                        </div>

                        <div className="pg-grid-4">
                            {filtered.map(event => (
                                <Link key={event.id} to={`/events/${event.id}`} className="ep-card">
                                    <div className="ep-img-wrap">
                                        <img src={event.img} alt={event.title} loading="lazy" />
                                        {event.badge && (
                                            <span 
                                                className="ep-badge" 
                                                style={{ backgroundColor: event.badgeColor || '#6366f1' }}
                                            >
                                                {event.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ep-content">
                                        <h3>{event.title}</h3>
                                        <div className="ep-meta">
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                {event.location}
                                            </span>
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                {event.date}
                                            </span>
                                        </div>
                                        <div className="ep-footer">
                                            <span className="ep-price">{event.price || 'Free'}</span>
                                            <span className="ep-arrow-btn">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="ep-empty">
                                <div className="ep-empty-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="11" cy="11" r="8"/>
                                        <path d="M21 21l-4.35-4.35"/>
                                    </svg>
                                </div>
                                <h3>No events match your criteria</h3>
                                <p>Try adjusting your search terms or clearing selected filters.</p>
                                <button className="btn-purple" onClick={handleClear}>
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}