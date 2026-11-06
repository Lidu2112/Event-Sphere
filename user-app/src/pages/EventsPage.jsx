import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../api/events';
import { imageUrl } from '../api/config';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceIcon from '@mui/icons-material/Place';
// import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import Loader from '../components/Loader/Loader';
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
            {/* Hero Section with increased height & floating particles */}
            <header 
                className="page-hero ep-hero"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(30, 15, 28, 0.94) 0%, rgba(30, 15, 28, 0.8) 50%, rgba(30, 15, 28, 0.5) 100%), 
                    url(https://as1.ftcdn.net/v2/jpg/21/20/63/38/1000_F_2120633815_NptYzpAbg6W8CRasm4GxxvUitHqITkGP.jpg)`
                }}
            >
                {/* Animated Floating Event Particles */}
                <div className="ep-hero-particles">
                    <span className="particle particle-1"></span>
                    <span className="particle particle-2"></span>
                    <span className="particle particle-3"></span>
                    <span className="particle particle-4"></span>
                    <span className="particle particle-5"></span>
                </div>

                <div className="page-hero-inner ep-hero-inner">
                    <span className="ep-hero-subtitle">— DISCOVER EXPERIENCES</span>
                    <h1>{t(lang, 'ep_title')}</h1>
                    <p>{t(lang, 'ep_subtitle')}</p>
                </div>
            </header>

            <main className="page-body">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-input-wrap search-wrap">
                        <SearchIcon className="filter-icon" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder={t(lang, 'ep_search')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && <button className="clear-input-btn" onClick={() => setSearch('')} aria-label="Clear search"><CloseIcon aria-hidden="true" /></button>}
                    </div>

                    <div className="filter-divider" />

                    <div className="filter-input-wrap custom-select" ref={dropdownRef}>
                        <FilterListIcon className="filter-icon" aria-hidden="true" />
                        <button type="button" className="select-trigger" onClick={() => setIsDropdownOpen(o => !o)}>
                            <span>{displayCategory}</span>
                            <ExpandMoreIcon className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} aria-hidden="true" />
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
                        <Loader />
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
                                        <img
                                            src={imageUrl(event.img || event.banner) || '/images/events/banner_1792931809869.jpg'}
                                            alt={event.title}
                                            loading="lazy"
                                            onError={e => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = '/images/events/banner_1792931809869.jpg';
                                            }}
                                        />
                                        {event.badge && (
                                            <span className="ep-badge" style={{ backgroundColor: event.badgeColor || '#6366f1' }}>
                                                {event.badge}
                                            </span>
                                        )}
                                        <span className="ep-wishlist-icon">
                                            <FavoriteBorderIcon aria-hidden="true" />
                                        </span>
                                    </div>
                                    <div className="ep-content">
                                        <h3>{event.title}</h3>
                                        <div className="ep-meta">
                                            <span>
                                                <PlaceIcon aria-hidden="true" />
                                                {event.location}
                                            </span>
                                            <span>
                                                {/* <CalendarTodayIcon aria-hidden="true" /> */}
                                                {event.date}
                                            </span>
                                        </div>
                                        <div className="ep-footer">
                                            <span className="ep-price">{event.price || 'Free'}</span>
                                            <span className="ep-ticket-btn">
                                                Get Ticket <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="ep-empty">
                                <div className="ep-empty-icon">
                                    <SearchIcon aria-hidden="true" />
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