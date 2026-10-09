import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Page.css';
import './VendorDetail.css';

import { apiUrl } from '../api/config';

const API_URL = apiUrl('/api');

export default function VendorDetail() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${API_URL}/vendor/services/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    setError(data.message || 'Service not found');
                    return;
                }
                setService(data.service);
            })
            .catch(err => {
                console.error('Failed to load service:', err);
                setError('Failed to load service.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="not-found">
                <h2>Loading service...</h2>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="not-found">
                <h2>{error || 'Service not found'}</h2>
                <Link to="/vendors" className="btn-purple">← Back to Vendors</Link>
            </div>
        );
    }

    return (
        <div>
            <div className="page-hero">
                <div className="page-hero-inner">
                    <div className="page-breadcrumb">
                        <Link to="/">Home</Link> / <Link to="/vendors">Vendors</Link> / {service.name}
                    </div>
                    <h1>{service.name}</h1>
                    <p>{service.category} · {service.status?.toUpperCase() || 'SERVICE'}</p>
                </div>
            </div>

            <div className="page-body vd-body">
                <div className="vd-main">
                    <div className="vd-img-wrap">
                        <img
                            src={service.image ? apiUrl(service.image) : '/default-vendor.jpg'}
                            alt={service.name}
                        />
                    </div>

                    <div className="vd-section">
                        <h3>About</h3>
                        <p>{service.description || 'No description provided.'}</p>
                    </div>

                    <div className="vd-section">
                        <h3>Service Details</h3>
                        <div className="vd-services">
                            <div className="vd-service">✓ Price: ETB {Number(service.price || 0).toLocaleString()}</div>
                            <div className="vd-service">✓ Unit: {service.priceUnit || 'per event'}</div>
                            <div className="vd-service">✓ Status: {service.status || 'active'}</div>
                            <div className="vd-service">✓ Bookings: {service.bookings || 0}</div>
                            <div className="vd-service">✓ Revenue: ETB {Number(service.revenue || 0).toLocaleString()}</div>
                            <div className="vd-service">✓ Rating: {service.rating || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="vd-sidebar">
                    <div className="vd-contact-box" style={{ borderTopColor: '#8b5cf6' }}>
                        <div className="vd-cb-header">
                            <div className="vd-cb-avatar" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                                {service.name[0]}
                            </div>
                            <div>
                                <div className="vd-cb-name">{service.name}</div>
                                <div className="vd-cb-cat">{service.category}</div>
                            </div>
                        </div>

                        <div className="vd-stats">
                            <div className="vd-stat">
                                <div className="vd-stat-val">⭐ {service.rating || 0}</div>
                                <div className="vd-stat-lbl">Rating</div>
                            </div>
                            <div className="vd-stat">
                                <div className="vd-stat-val">{service.bookings || 0}</div>
                                <div className="vd-stat-lbl">Bookings</div>
                            </div>
                            <div className="vd-stat">
                                <div className="vd-stat-val">{service.status || 'active'}</div>
                                <div className="vd-stat-lbl">Status</div>
                            </div>
                        </div>

                        <div className="vd-price-tag">ETB {Number(service.price || 0).toLocaleString()}</div>

                        <button className="btn-purple" style={{ background: '#8b5cf6', border: 'none', width: '100%', justifyContent: 'center', padding: '13px' }}>
                            📩 Request Booking
                        </button>
                        <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                            💬 Send Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
