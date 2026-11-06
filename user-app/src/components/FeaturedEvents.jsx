import { useState, useEffect } from 'react';
import { apiUrl, imageUrl } from '../api/config';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FestivalIcon from '@mui/icons-material/Festival';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import Loader from './Loader/Loader';
import './FeaturedEvents.css';

const CATEGORY_COLORS = {
    Concert: '#8b5cf6', Music: '#8b5cf6', Conference: '#3b82f6', Business: '#3b82f6',
    Sports: '#10b981', Exhibition: '#f59e0b', Art: '#f59e0b', Workshop: '#06b6d4',
    Festival: '#ec4899', Wedding: '#ec4899', Food: '#f97316', Cultural: '#f97316',
    Networking: '#64748b', Seminar: '#6366f1', Webinar: '#8b5cf6', Event: '#6366f1',
};

export default function FeaturedEvents() {
    const { lang } = useLang();
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search fields
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [searchDate, setSearchDate] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(apiUrl('/api/events'))
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch events');
                }
                return res.json();
            })
            .then(data => {
                const dbEvents = (data.events || [])
                    .filter(e => e.source === 'db')
                    .map(e => ({
                        id: e.id,
                        title: e.title,
                        location: e.location || e.venue || '',
                        date: e.date,
                        price: e.price || (Number(e.ticketPrice) === 0 ? 'Free' : `ETB ${Number(e.ticketPrice).toLocaleString()}`),
                        image: imageUrl(e.img || e.banner) || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
                        category: e.badge || e.category || 'Event',
                        categoryColor: e.badgeColor || CATEGORY_COLORS[e.badge] || CATEGORY_COLORS[e.category] || '#6366f1',
                    }));
                setAllEvents(dbEvents);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Connection error. Please check your internet connection.');
                setAllEvents([]);
                setLoading(false);
            });
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
                        <h2 className="featured-title">{t(lang, 'featured_title')}</h2>
                    </div>

                    {/* Embedded Search bar */}
                    <div className="featured-search-bar">
                        <div className="fsb-field">
                            <SearchIcon aria-hidden="true" style={{ fontSize: 16 }} />
                            <input
                                type="text"
                                placeholder={t(lang, 'featured_search_name')}
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                            />
                        </div>

                        <div className="fsb-divider" />
                        <div className="fsb-field">
                            {/* <LocalOfferIcon aria-hidden="true" style={{ fontSize: 14 }} /> */}
                            <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="fsb-divider" />
                        <div className="fsb-field">
                            {/* <PlaceIcon aria-hidden="true" style={{ fontSize: 14 }} /> */}
                            <input
                                type="text"
                                placeholder={t(lang, 'featured_search_city')}
                                value={searchCity}
                                onChange={e => setSearchCity(e.target.value)}
                            />
                        </div>
                        <div className="fsb-divider" />
                        <div className="fsb-field">
                            {/* <CalendarTodayIcon aria-hidden="true" style={{ fontSize: 14 }} /> */}
                            <input
                                type="date"
                                value={searchDate}
                                onChange={e => setSearchDate(e.target.value)}
                            />
                        </div>
                        <button className="fsb-btn" onClick={() => { setSearchName(''); setSearchCategory(''); setSearchCity(''); setSearchDate(''); }}>
                            {t(lang, 'featured_clear')}
                        </button>
                    </div>

                    <Link to="/events" className="featured-view-all">
                        {t(lang, 'featured_view_all')} <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} />
                    </Link>
                </div>

                {loading ? (
                    <Loader />
                ) : error ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ marginBottom: 12 }}>
                            <WifiOffIcon aria-hidden="true" style={{ fontSize: 40, color: '#ef4444' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#1e293b' }}>
                            {error}
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ marginBottom: 12 }}><FestivalIcon aria-hidden="true" style={{ fontSize: 40 }} /></div>
                        <p style={{ margin: 0, fontSize: 15 }}>
                            {allEvents.length === 0 ? t(lang, 'featured_no_events') : t(lang, 'featured_no_match')}
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
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            loading="lazy"
                                            onError={e => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = '/images/events/banner_1792931809869.jpg';
                                            }}
                                        />
                                        <span
                                            className="featured-card-category"
                                            style={{ background: event.categoryColor }}
                                        >
                                            {(event.category === 'Concert' || event.category === 'Music') && (
                                                <MusicNoteIcon aria-hidden="true" style={{ fontSize: 10 }} />
                                            )} 
                                            {event.category}
                                        </span>
                                        <button 
                                            className="featured-card-heart" 
                                            onClick={(e) => { e.preventDefault(); }}
                                            aria-label="Save Event"
                                        >
                                            <FavoriteBorderIcon aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="featured-card-content">
                                        <h3 className="featured-card-title">{event.title}</h3>
                                        <div className="featured-card-details">
                                            <div className="featured-card-location">
                                                <PlaceIcon aria-hidden="true" />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="featured-card-date">
                                                <CalendarTodayIcon aria-hidden="true" />
                                                <span>{event.date}</span>
                                            </div>
                                        </div>
                                        <div className="featured-card-footer">
                                            <span className="featured-card-price">{event.price}</span>
                                            <span className="featured-card-btn">
                                                Get Ticket <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} />
                                            </span>
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