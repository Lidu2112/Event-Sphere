import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import { apiUrl, imageUrl } from '../api/config';
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from '@mui/icons-material/Star';
import './Page.css';
import './VendorsPage.css';

const API_URL = apiUrl('/api');

export default function VendorsPage() {
    const { lang } = useLang();
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/vendor/services`)
            .then(res => res.json())
            .then(data => setServices(data.services || []))
            .catch(err => console.error('Failed to load services:', err))
            .finally(() => setLoading(false));
    }, []);

    const cats = ['All', ...new Set(services.map(s => s.category || 'Other'))];

    const filtered = services.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All' || s.category === category;
        return matchSearch && matchCat;
    });

    return (
        <div className="vendors-page-wrapper">
            {/* Hero Section matching Image 1 style (Compact full-width banner with search bar) */}
            <div 
                className="page-hero vp-hero"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(30, 15, 28, 0.94) 0%, rgba(30, 15, 28, 0.8) 50%, rgba(30, 15, 28, 0.5) 100%), 
                    url(https://as1.ftcdn.net/v2/jpg/21/20/63/38/1000_F_2120633815_NptYzpAbg6W8CRasm4GxxvUitHqITkGP.jpg)`
                }}
            >
                <div className="vp-hero-inner">
                    <div className="vp-hero-text">
                        <span className="vp-hero-subtitle">— Our Trusted Partners</span>
                        <h1>{t(lang, 'vp_title') || 'Event Vendors'}</h1>
                        <p>{t(lang, 'vp_subtitle') || 'Find the best service providers for your events'}</p>
                    </div>

                    {/* Integrated Search Bar in Hero */}
                    <div className="vp-hero-search-box">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder={t(lang, 'vp_search') || 'Search vendors...'}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button className="vp-search-btn">Search</button>
                    </div>
                </div>
            </div>

            <div className="page-body">
                {/* Category Filter Pills Bar */}
                <div className="vp-pills">
                    {cats.map(c => (
                        <button 
                            key={c} 
                            className={`ep-pill ${category === c ? 'active' : ''}`}
                            onClick={() => setCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        {t(lang, 'vp_loading')}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="vp-empty-card">
                        <p>{t(lang, 'vp_empty')}</p>
                    </div>
                ) : (
                    <div className="vp-grid">
                        {filtered.map(s => (
                            <Link key={s._id} to={`/vendors/${s._id}`} className="vp-card">
                                <div className="vp-img-wrap">
                                    <img
                                        src={s.image ? imageUrl(s.image) : '/images/default-vendor.svg'}
                                        alt={s.name}
                                        loading="lazy"
                                        onError={e => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = '/images/default-vendor.svg';
                                        }}
                                    />
                                    <span className="vp-badge-tag">{s.category || 'Verified'}</span>
                                </div>
                                <div className="vp-content">
                                    <div className="vp-cat">{s.category}</div>
                                    <h3 className="vp-name">{s.name}</h3>
                                    <p className="vp-desc">
                                        {s.description
                                            ? (s.description.length > 90 ? s.description.substring(0, 90) + '...' : s.description)
                                            : (lang === 'am' ? 'ለዝርዝሮ ያሰሱ' : 'Explore professional services tailored for your unique event experience.')}
                                    </p>
                                    <div className="vp-footer">
                                        <div className="vp-rating">
                                            <StarIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /> <strong>{s.rating || '0.0'}</strong>
                                            <span>({s.bookings || 0} {t(lang, 'vp_bookings') || 'reviews'})</span>
                                        </div>
                                        <span className="vp-price">ETB {Number(s.price || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Bottom Call-To-Action Banner matching Image 1 */}
                {/* <div className="vp-cta-banner">
                    <div className="vp-cta-content">
                        <h2>Become a Vendor on EventSphere</h2>
                        <p>Showcase your services and grow your business with us.</p>
                    </div>
                    <div className="vp-cta-actions">
                        <Link to="/register-vendor" className="vp-btn-primary">Register as Vendor →</Link>
                    </div>
                </div> */}
            </div>
        </div>
    );
}