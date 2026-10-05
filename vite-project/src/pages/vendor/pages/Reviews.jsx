import { useEffect, useState } from 'react';
import { PageHeader, SectionBox, StatCard } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

function Stars({ rating, size = 16 }) {
    return (
        <span style={{ display: 'inline-flex', gap: 1 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} style={{ fontSize: size, color: n <= rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
            ))}
        </span>
    );
}

function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <span style={{ display: 'inline-flex', gap: 2, cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                    style={{ fontSize: 28, color: n <= (hover || value) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s' }}>★</span>
            ))}
        </span>
    );
}

export default function Reviews() {
    const { user } = useAuth();
    const email = user?.email || '';
    const vendorId = user?.id || user?._id || '';

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ rating: 0, comment: '', reviewerName: '', reviewerEmail: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });

    useEffect(() => {
        if (!email) return;
        load();
    }, [email]);

    async function load() {
        setLoading(true);
        try {
            const d = await vendorApi.getReviews(email);
            setReviews(d.reviews || []);
        } catch { setReviews([]); }
        finally { setLoading(false); }
    }

    async function handleSubmit() {
        if (!form.rating) { setMsg({ text: 'Please select a rating.', ok: false }); return; }
        if (!form.reviewerName.trim()) { setMsg({ text: 'Reviewer name is required.', ok: false }); return; }
        setSaving(true);
        try {
            await vendorApi.submitReview({
                vendorEmail: email, vendorId,
                reviewerName: form.reviewerName, reviewerEmail: form.reviewerEmail,
                rating: form.rating, comment: form.comment,
            });
            setForm({ rating: 0, comment: '', reviewerName: '', reviewerEmail: '' });
            setShowForm(false);
            setMsg({ text: '✅ Review added!', ok: true });
            load();
        } catch (e) { setMsg({ text: e.message, ok: false }); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this review?')) return;
        try {
            await vendorApi.deleteReview(id);
            setReviews(r => r.filter(x => x._id !== id));
        } catch (e) { alert(e.message); }
    }

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';

    const dist = [5, 4, 3, 2, 1].map(n => ({
        star: n,
        count: reviews.filter(r => r.rating === n).length,
        pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
    }));

    return (
        <div>
            <PageHeader
                title="Reviews & Ratings"
                subtitle="See what clients say about your services"
                action={<button className="btn-primary" onClick={() => { setShowForm(s => !s); setMsg({ text: '', ok: true }); }}>+ Add Review</button>}
            />

            {/* Summary stats */}
            <div className="stats-grid">
                <StatCard icon="⭐" label="Average Rating" value={avgRating} color="#f59e0b" />
                <StatCard icon="💬" label="Total Reviews" value={reviews.length} color="#6366f1" />
                <StatCard icon="🏆" label="5-Star Reviews" value={reviews.filter(r => r.rating === 5).length} color="#10b981" />
                <StatCard icon="📊" label="Satisfaction" value={reviews.length ? `${Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%` : '—'} color="#0ea5e9" />
            </div>

            {/* Rating distribution */}
            {reviews.length > 0 && (
                <SectionBox title="Rating Breakdown">
                    <div style={{ maxWidth: 400 }}>
                        {dist.map(d => (
                            <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#f59e0b', whiteSpace: 'nowrap', width: 40 }}>{'★'.repeat(d.star)}</span>
                                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                                    <div style={{ width: `${d.pct}%`, height: '100%', background: '#f59e0b', borderRadius: 99, transition: 'width 0.5s' }} />
                                </div>
                                <span style={{ fontSize: 12, color: '#94a3b8', width: 30, textAlign: 'right' }}>{d.count}</span>
                            </div>
                        ))}
                    </div>
                </SectionBox>
            )}

            {/* Add review inline form */}
            {showForm && (
                <SectionBox title="Add a Review">
                    <div style={grid2}>
                        <div>
                            <label style={labelStyle}>Reviewer Name *</label>
                            <input value={form.reviewerName} onChange={e => setForm(f => ({ ...f, reviewerName: e.target.value }))}
                                placeholder="Client name" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Reviewer Email</label>
                            <input value={form.reviewerEmail} onChange={e => setForm(f => ({ ...f, reviewerEmail: e.target.value }))}
                                placeholder="client@email.com" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <label style={labelStyle}>Rating *</label>
                        <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                        {form.rating > 0 && <span style={{ marginLeft: 10, fontSize: 13, color: '#64748b' }}>{form.rating}/5</span>}
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <label style={labelStyle}>Comment</label>
                        <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                            rows={3} placeholder="What did the client say about your service?"
                            style={{ ...inputStyle, resize: 'vertical', height: 80 }} />
                    </div>
                    {msg.text && (
                        <div style={{
                            padding: '8px 12px', borderRadius: 6, marginTop: 10,
                            background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626', fontSize: 13
                        }}>
                            {msg.text}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Submit Review'}
                        </button>
                    </div>
                </SectionBox>
            )}

            {msg.text && !showForm && (
                <div style={{
                    padding: '10px 16px', borderRadius: 8, marginBottom: 12,
                    background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626', fontSize: 14
                }}>
                    {msg.text}
                </div>
            )}

            {/* Reviews list */}
            <SectionBox title={`All Reviews (${reviews.length})`}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
                        <p style={{ margin: 0, fontSize: 15 }}>No reviews yet.</p>
                        <p style={{ margin: '4px 0 0', fontSize: 13 }}>Reviews from clients will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {reviews.map(r => (
                            <div key={r._id} style={reviewCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{r.reviewerName}</div>
                                        {r.reviewerEmail && <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.reviewerEmail}</div>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Stars rating={r.rating} />
                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                        <button onClick={() => handleDelete(r._id)} title="Delete review"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 14, padding: '2px 6px' }}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {r.comment && <p style={{ margin: '10px 0 0', color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>
        </div>
    );
}

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none' };
const btnSecondary = { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 14, color: '#475569' };
const reviewCard = { padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fafafa' };
