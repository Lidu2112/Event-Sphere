import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Page.css';
import './VendorsPage.css';

import { apiUrl } from '../api/config';

const API_URL = apiUrl('/api');

export default function VendorsPage() {
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
        <div>
            <div className="page-hero">
                <div className="page-hero-inner">
                    <div className="page-breadcrumb">
                        <Link to="/">Home</Link> / Vendors
                    </div>
                    <h1>Event Vendors</h1>
                    <p>Find the best service providers for your events</p>
                </div>
            </div>

            <div className="page-body">
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="🔍  Search services..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        {cats.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>

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
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading services...</div>
                ) : (
                    <div className="pg-grid-3">
                        {filtered.map(s => (
                            <Link key={s._id} to={`/vendors/${s._id}`} className="vp-card">
                                <div className="vp-img-wrap">
                                    <img
                                        src={s.image ? apiUrl(s.image) : '/default-vendor.jpg'}
                                        alt={s.name}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="vp-content">
                                    <div className="vp-cat">{s.category}</div>
                                    <h3 className="vp-name">{s.name}</h3>
                                    <p className="vp-desc">{(s.description || '').slice(0, 80)}...</p>
                                    <div className="vp-footer">
                                        <div className="vp-rating">
                                            ⭐ <strong>{s.rating || 0}</strong>
                                            <span>({s.bookings || 0} bookings)</span>
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
