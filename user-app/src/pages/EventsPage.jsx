import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../api/events';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import './EventsPage.css';

export default function EventsPage() {
    const { lang } = useLang();
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const ALL_LABEL = t(lang, 'ep_all_categories');

    useEffect(() => {
        fetchEvents()
            .then(data => setAllEvents(data.filter(e => e.source === 'db')))
            .catch(() => setAllEvents([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handle = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const cats = [ALL_LABEL, ...new Set(allEvents.map(e => e.badge).filter(Boolean))];

    const filtered = allEvents.filter(e => {
        const matchSearch = !search ||
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            (e.location || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = !category || category === ALL_LABEL || e.badge === category;
        return matchSearch && matchCat;
    });

    const handleClear = () => { setSearch(''); setCategory(''); };

    const displayCategory = category || ALL_LABEL;

    return (
        <div className="ep-page-wrapper">
            <header className="page-hero">
                <div className="page-hero-inner">
                    <h1>{t(lang, 'ep_title')}</h1>
                    <p>{t(lang, 'ep_subtitle')}</p>
                </div>
            </header>

            <main className="page-body">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-input-wrap search-wrap">
                        <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder={t(lang, 'ep_search')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && <button className="clear-input-btn" onClick={() => setSearch('')}>×</button>}
                    </div>

                    <div className="filter-divider" />

                    <div className="filter-input-wrap custom-select" ref={dropdownRef}>
                        <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        <button type="button" className="select-trigger" onClick={() => setIsDropdownOpen(o => !o)}>
                            <span>{displayCategory}</span>
                            <svg className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <ul className="select-dropdown">
                                {cats.map(c => (
                                    <li key={c} className={displayCategory === c ? 'active' : ''}
                                        onClick={() => { setCategory(c === ALL_LABEL ? '' : c); setIsDropdownOpen(false); }}>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {(search || category) && (
                        <button className="btn-reset" onClick={handleClear}>
                            {t(lang, 'ep_reset')}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="ep-loading-state">
                        <div className="spinner" />
                        <p>{t(lang, 'ep_loading')}</p>
                    </div>
                ) : (
                    <>
                        <div className="ep-header-meta">
                            <h2>
                                {t(lang, 'ep_showing')} {filtered.length} {filtered.length === 1 ? t(lang, 'ep_event') : t(lang, 'ep_events')}
                            </h2>
                        </div>

                        <div className="pg-grid-4">
                            {filtered.map(event => (
                                <Link key={event.id} to={`/events/${event.id}`} className="ep-card">
                                    <div className="ep-img-wrap">
                                        <img src={event.img} alt={event.title} loading="lazy" />
                                        {event.badge && (
                                            <span className="ep-badge" style={{ backgroundColor: event.badgeColor || '#6366f1' }}>
                                                {event.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ep-content">
                                        <h3>{event.title}</h3>
                                        <div className="ep-meta">
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                {event.location}
                                            </span>
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                                {event.date}
                                            </span>
                                        </div>
                                        <div className="ep-footer">
                                            <span className="ep-price">{event.price || 'Free'}</span>
                                            <span className="ep-arrow-btn">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
                                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                                    </svg>
                                </div>
                                <h3>{t(lang, 'ep_no_results')}</h3>
                                <p>{t(lang, 'ep_no_results_sub')}</p>
                                <button className="btn-purple" onClick={handleClear}>
                                    {t(lang, 'ep_clear_filters')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
