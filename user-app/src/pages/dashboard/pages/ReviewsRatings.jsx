import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendeeApi } from '../../../api/attendee';
import './SubPage.css';

import { apiUrl } from '../../../api/config';

const BASE = apiUrl('/api');

async function apiReq(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
}

function Stars({ rating }) {
    return <span style={{ color: '#f59e0b', fontSize: 18 }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function ReviewsRatings() {
    const { user } = useAuth();
    const [myReviews, setMyReviews] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user?.email) return;
        Promise.all([
            apiReq('GET', `/attendee/reviews?userEmail=${encodeURIComponent(user.email)}`),
            attendeeApi.getPurchases(user.email),
        ]).then(([r, p]) => {
            setMyReviews(r.reviews || []);
            setPurchases(p.bookings || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [user]);

    // bookings not yet reviewed
    const pending = purchases.filter(b =>
        !myReviews.find(r => r.bookingId?.toString() === b._id?.toString())
    );

    async function handleSubmit(e) {
        e.preventDefault();
        if (!rating) { setMsg('Please select a rating.'); return; }
        setSubmitting(true);
        setMsg('');
        try {
            await apiReq('POST', '/attendee/reviews', {
                reviewerName: user.name || user.email,
                reviewerEmail: user.email,
                rating,
                comment,
                bookingId: selected._id,
                serviceName: selected.serviceName,
                vendorEmail: selected.vendorEmail,
            });
            const r = await apiReq('GET', `/attendee/reviews?userEmail=${encodeURIComponent(user.email)}`);
            setMyReviews(r.reviews || []);
            setSelected(null); setRating(0); setComment('');
            setMsg('✅ Review submitted! Thank you.');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <div className="sp-header">
                <h1 className="sp-title">Reviews & Ratings</h1>
                <p className="sp-sub">{myReviews.length} review{myReviews.length !== 1 ? 's' : ''} submitted</p>
            </div>

            {msg && (
                <div style={{
                    padding: '10px 16px', borderRadius: 8, marginBottom: 16,
                    background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
                    color: msg.startsWith('✅') ? '#16a34a' : '#dc2626', fontSize: 14
                }}>
                    {msg}
                </div>
            )}

            {/* Pending reviews */}
            {pending.length > 0 && (
                <div className="sp-section">
                    <h3 className="sp-section-title">Pending Reviews ({pending.length})</h3>
                    <div className="sp-pending-list">
                        {pending.map((b, i) => (
                            <div key={i} className="sp-pending-item">
                                <div className="sp-pending-info">
                                    <strong>{b.eventName || b.serviceName}</strong>
                                    <span>{b.eventDate}</span>
                                </div>
                                <button className="sp-review-btn" onClick={() => { setSelected(b); setRating(0); setComment(''); setMsg(''); }}>
                                    ⭐ Write Review
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review form modal */}
            {selected && (
                <div className="sp-modal-overlay" onClick={() => setSelected(null)}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 16px' }}>Review: {selected.eventName || selected.serviceName}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="sp-stars">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s}
                                        className={`sp-star ${s <= (hover || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(s)}
                                        onMouseEnter={() => setHover(s)}
                                        onMouseLeave={() => setHover(0)}
                                    >★</span>
                                ))}
                            </div>
                            <textarea value={comment} onChange={e => setComment(e.target.value)}
                                placeholder="Share your experience..." rows={4} required />
                            {msg && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{msg}</div>}
                            <div className="sp-modal-btns">
                                <button type="button" onClick={() => setSelected(null)}>Cancel</button>
                                <button type="submit" className="sp-submit-btn" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* My reviews */}
            <div className="sp-section">
                <h3 className="sp-section-title">My Reviews</h3>
                {loading ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading reviews...</div>
                ) : myReviews.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
                        <p style={{ margin: 0, fontSize: 14 }}>No reviews yet. Complete a booking to leave a review.</p>
                    </div>
                ) : (
                    myReviews.map((r, i) => (
                        <div key={i} className="sp-review-card">
                            <div className="sp-review-body">
                                <strong>{r.serviceName || r.eventName || 'Service'}</strong>
                                <div className="sp-review-stars"><Stars rating={r.rating} /></div>
                                {r.comment && <p>{r.comment}</p>}
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
