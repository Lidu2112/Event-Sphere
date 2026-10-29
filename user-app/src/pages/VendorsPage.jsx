import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import { apiUrl, imageUrl } from '../api/config';
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
            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1>{t(lang, 'vp_title')}</h1>
                    <p>{t(lang, 'vp_subtitle')}</p>
                </div>
            </div>

            <div className="page-body">
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder={t(lang, 'vp_search')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        {cats.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>

                <div className="vp-pills">
                    {cats.map(c => (
                        <button key={c} className={`ep-pill ${category === c ? 'active' : ''}`}
                            onClick={() => setCategory(c)}>
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
                                            ⭐ <strong>{s.rating || '0.0'}</strong>
                                            <span>({s.bookings || 0} {t(lang, 'vp_bookings')})</span>
                                        </div>
                                        <span className="vp-price">ETB {Number(s.price || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
