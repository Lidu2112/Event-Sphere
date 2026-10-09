import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';

import { apiUrl } from '../../../api/config';

const BASE = apiUrl('/api/attendee');

function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n}
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ fontSize: 26, cursor: 'pointer', color: n <= (hover || value) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s' }}>
                    ★
                </span>
            ))}
        </div>
    );
}

export default function SubmitReview() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (!user?.email) return;
        Promise.all([
            fetch(`${BASE}/tickets?userEmail=${encodeURIComponent(user.email)}`).then(r => r.json()),
            fetch(`${BASE}/reviews?userEmail=${encodeURIComponent(user.email)}`).then(r => r.json()),
        ]).then(([t, r]) => {
            setTickets(t.tickets || []);
            setMyReviews(r.reviews || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [user]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedEvent) { setMsg({ ok: false, text: 'Please select an event.' }); return; }
        if (!rating) { setMsg({ ok: false, text: 'Please select a rating.' }); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorEmail: '',
                    vendorId: null,
                    reviewerName: user?.name || user?.email || 'Attendee',
                    reviewerEmail: user?.email || '',
                    rating,
                    comment,
                    serviceName: selectedEvent,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setMyReviews(prev => [data.review, ...prev]);
            setSelectedEvent(''); setRating(0); setComment('');
            setMsg({ ok: true, text: '✅ Review submitted successfully!' });
            setTimeout(() => setMsg(null), 3000);
        } catch (err) {
            setMsg({ ok: false, text: err.message });
        } finally { setSubmitting(false); }
    }

    const lbl = { fontSize: '11px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' };
    const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' };

    return (
        <div>
            <PageHeader title="Submit Review" subtitle="Rate and review events you attended" />

            {msg && (
                <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600, background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626' }}>
                    {msg.text}
                </div>
            )}

            <SectionBox title="Leave a Review">
                {loading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading your events...</div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
                        <div>
                            <label style={lbl}>Select Event *</label>
                            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={inp}>
                                <option value="">— Choose an event you attended —</option>
                                {tickets.map((t, i) => (
                                    <option key={i} value={t.eventName}>{t.eventName} ({t.eventDate})</option>
                                ))}
                            </select>
                            {tickets.length === 0 && (
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: '5px 0 0' }}>No paid tickets found. Buy a ticket first to leave a review.</p>
                            )}
                        </div>
                        <div>
                            <label style={lbl}>Rating *</label>
                            <StarPicker value={rating} onChange={setRating} />
                            {rating > 0 && <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>{rating}/5</span>}
                        </div>
                        <div>
                            <label style={lbl}>Your Review</label>
                            <textarea value={comment} onChange={e => setComment(e.target.value)}
                                style={{ ...inp, minHeight: 100, resize: 'vertical' }}
                                placeholder="Share your experience..." />
                        </div>
                        <button className="btn-primary" type="submit" disabled={submitting || tickets.length === 0} style={{ alignSelf: 'flex-start' }}>
                            {submitting ? 'Submitting...' : '⭐ Submit Review'}
                        </button>
                    </form>
                )}
            </SectionBox>

            {/* Previous reviews */}
            {myReviews.length > 0 && (
                <SectionBox title={`My Reviews (${myReviews.length})`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {myReviews.map((r, i) => (
                            <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <strong style={{ fontSize: 13 }}>{r.serviceName || 'Event'}</strong>
                                    <span style={{ color: '#f59e0b', fontSize: 16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                </div>
                                {r.comment && <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>{r.comment}</p>}
                                <p style={{ margin: '5px 0 0', fontSize: 11, color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </SectionBox>
            )}
        </div>
    );
}
