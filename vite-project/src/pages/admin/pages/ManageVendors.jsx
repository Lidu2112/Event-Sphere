import { useState, useEffect } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

const STATIC_VENDORS = [
    { _id: '1', name: 'Beza Haile', service: 'Photography', email: 'beza@email.com', phone: '+251911001', bookings: 12, revenue: 'ETB 24K', rating: 4.8, status: 'active' },
    { _id: '2', name: 'Dawit Tesfaye', service: 'Catering', email: 'dawit@email.com', phone: '+251911002', bookings: 8, revenue: 'ETB 18K', rating: 4.9, status: 'active' },
];

const EMPTY_FORM = { name: '', email: '', phone: '' };

export default function ManageVendors() {
    const [vendors, setVendors] = useState(STATIC_VENDORS);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [actionId, setActionId] = useState(null);
    const [detailModal, setDetailModal] = useState(null); // 'services'|'bookings'|'reviews'|'payments'
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => { loadVendors(); }, [search]);

    async function loadVendors() {
        try {
            const data = await api.getVendors(search ? { search } : {});
            const enriched = (data.vendors || []).map(v => ({
                ...v,
                service: v.service || v.category || 'Service Provider',
                bookings: v.bookings ?? 0,
                revenue: v.revenue || 'ETB 0',
                rating: v.rating ?? 0,
                status: v.status || 'active',
            }));
            setVendors(enriched.length > 0 ? enriched : []);
        } catch { setVendors([]); }
    }

    function openView(v) { setSelected(v); setModal('view'); }
    function openEdit(v) { setForm({ name: v.name, email: v.email || '', phone: v.phone || '' }); setSelected(v); setModal('edit'); }
    function closeModal() { setModal(null); setSelected(null); setMsg(''); }

    async function handleSave() {
        setSaving(true);
        try { await api.updateVendor(selected._id, form); closeModal(); loadVendors(); }
        catch (e) { setMsg(e.message); }
        finally { setSaving(false); }
    }

    async function doAction(fn, v) {
        setActionId(v._id);
        try { await fn(v._id); await loadVendors(); }
        catch (e) { alert(e.message); }
        finally { setActionId(null); }
    }

    async function openDetail(type, v) {
        setDetailLoading(true);
        setDetailModal(type);
        setSelected(v);
        setDetailData(null);
        try {
            let d;
            if (type === 'services') d = await api.getVendorServices(v._id);
            else if (type === 'bookings') d = await api.getVendorBookings(v._id);
            else if (type === 'reviews') d = await api.getVendorReviews(v._id);
            else if (type === 'payments') d = await api.getVendorPayments(v._id);
            setDetailData(d);
        } catch { setDetailData({ error: 'Failed to load' }); }
        finally { setDetailLoading(false); }
    }

    const displayed = search
        ? vendors.filter(v => v.name?.toLowerCase().includes(search.toLowerCase()) || (v.service || '').toLowerCase().includes(search.toLowerCase()))
        : vendors;

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Manage Vendors</h2>
                    <p className="page-subtitle">Oversee all service vendors on the platform</p>
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <input className="table-search" placeholder="🔍 Search vendor name or category..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
            </div>

            <div className="vendor-grid">
                {displayed.map(v => (
                    <div key={v._id} className="vendor-card">
                        <div className="vendor-header">
                            <div className="vendor-avatar">🏪</div>
                            <div className="vendor-info">
                                <div className="vendor-name">{v.name}</div>
                                <div className="vendor-service">{v.service || v.category || 'Vendor'}</div>
                            </div>
                            <span className={`status-badge ${v.status || 'active'}`}>{v.status || 'active'}</span>
                        </div>

                        <div className="vendor-stats">
                            <div className="vendor-stat"><span className="vs-icon">📦</span><div><div className="vs-value">{v.bookings ?? 0}</div><div className="vs-label">Bookings</div></div></div>
                            <div className="vendor-stat"><span className="vs-icon">💰</span><div><div className="vs-value">{v.revenue || 'ETB 0'}</div><div className="vs-label">Revenue</div></div></div>
                            <div className="vendor-stat"><span className="vs-icon">⭐</span><div><div className="vs-value">{v.rating > 0 ? v.rating : 'N/A'}</div><div className="vs-label">Rating</div></div></div>
                        </div>

                        {/* Primary actions */}
                        <div className="vendor-actions" style={{ flexWrap: 'wrap', gap: 4 }}>
                            <button className="btn-secondary" onClick={() => openView(v)}>👁️ View</button>
                            <button className="btn-secondary" onClick={() => openEdit(v)}>✏️ Edit</button>
                            <button className="btn-secondary" onClick={() => openDetail('services', v)}>🛠 Services</button>
                            <button className="btn-secondary" onClick={() => openDetail('bookings', v)}>📋 Bookings</button>
                            <button className="btn-secondary" onClick={() => openDetail('reviews', v)}>⭐ Reviews</button>
                            <button className="btn-secondary" onClick={() => openDetail('payments', v)}>💳 Payments</button>
                        </div>

                        {/* Status actions */}
                        <div className="vendor-actions" style={{ flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {v.status !== 'active' && <button className="btn-approve" onClick={() => { if (window.confirm(`Approve ${v.name}?`)) doAction(api.approveVendor, v); }} disabled={actionId === v._id}>✅ Approve</button>}
                            {v.status !== 'rejected' && <button className="btn-reject" onClick={() => { if (window.confirm(`Reject ${v.name}?`)) doAction(api.rejectVendor, v); }} disabled={actionId === v._id}>✕ Reject</button>}
                            {v.status === 'active' && <button className="btn-secondary" style={{ color: '#dc2626' }} onClick={() => { if (window.confirm(`Suspend ${v.name}?`)) doAction(api.suspendVendor, v); }} disabled={actionId === v._id}>🚫 Suspend</button>}
                            {v.status === 'suspended' && <button className="btn-approve" onClick={() => { if (window.confirm(`Activate ${v.name}?`)) doAction(api.activateVendor, v); }} disabled={actionId === v._id}>✅ Activate</button>}
                            <button className="btn-reject" onClick={() => { if (window.confirm(`Delete ${v.name}?`)) doAction(api.deleteVendor, v); }} disabled={actionId === v._id}>🗑️ Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {modal === 'edit' && selected && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Edit Vendor — {selected.name}</h3>
                        {msg && <div className="modal-error">{msg}</div>}
                        <div className="modal-form">
                            <label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            <label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modal === 'view' && selected && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Vendor Details</h3>
                        <div className="view-detail-grid">
                            {[['Name', selected.name], ['Service', selected.service || '—'], ['Email', selected.email || '—'], ['Phone', selected.phone || '—'], ['Bookings', String(selected.bookings ?? 0)], ['Revenue', selected.revenue || 'ETB 0'], ['Rating', selected.rating > 0 ? `⭐ ${selected.rating}` : 'No ratings'], ['Status', selected.status || 'active']].map(([k, v]) => (
                                <div key={k} className="view-detail-row">
                                    <span className="view-detail-key">{k}</span>
                                    <span className="view-detail-val">{k === 'Status' ? <span className={`status-badge ${selected.status || 'active'}`}>{v}</span> : v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions"><button className="btn-secondary" onClick={closeModal}>Close</button></div>
                    </div>
                </div>
            )}

            {/* Detail Modal (services/bookings/reviews/payments) */}
            {detailModal && (
                <div className="modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '85vh', overflowY: 'auto' }}>
                        <h3>{detailModal === 'services' ? '🛠 Services' : detailModal === 'bookings' ? '📋 Bookings' : detailModal === 'reviews' ? '⭐ Reviews' : '💳 Payments'} — {selected?.name}</h3>
                        {detailLoading ? <p style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>Loading...</p> : detailData?.error ? (
                            <p style={{ color: '#ef4444' }}>{detailData.error}</p>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    {detailModal === 'services' && <tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th></tr>}
                                    {detailModal === 'bookings' && <tr><th>Client</th><th>Service</th><th>Date</th><th>Status</th><th>Amount</th></tr>}
                                    {detailModal === 'reviews' && <tr><th>Reviewer</th><th>Rating</th><th>Comment</th><th>Date</th></tr>}
                                    {detailModal === 'payments' && <tr><th>Client</th><th>Amount</th><th>Status</th><th>Date</th></tr>}
                                </thead>
                                <tbody>
                                    {detailModal === 'services' && (detailData?.services || []).map(s => (
                                        <tr key={s._id}><td className="td-bold">{s.name}</td><td>{s.category}</td><td>ETB {s.price}</td><td><span className={`status-badge ${s.status}`}>{s.status}</span></td></tr>
                                    ))}
                                    {detailModal === 'bookings' && (detailData?.bookings || []).map(b => (
                                        <tr key={b._id}><td>{b.clientName || b.clientEmail || '—'}</td><td>{b.serviceName || '—'}</td><td className="td-muted">{b.eventDate || '—'}</td><td><span className={`status-badge ${b.status}`}>{b.status}</span></td><td>ETB {b.amount || 0}</td></tr>
                                    ))}
                                    {detailModal === 'reviews' && (detailData?.reviews || []).map(r => (
                                        <tr key={r._id}><td>{r.reviewerName || r.reviewerEmail || '—'}</td><td>{'⭐'.repeat(r.rating || 0)} {r.rating}/5</td><td>{r.comment || '—'}</td><td className="td-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td></tr>
                                    ))}
                                    {detailModal === 'payments' && (detailData?.bookings || []).map(b => (
                                        <tr key={b._id}><td>{b.clientName || b.clientEmail || '—'}</td><td>ETB {b.amount || 0}</td><td><span className={`status-badge ${b.paymentStatus || 'pending'}`}>{b.paymentStatus || 'pending'}</span></td><td className="td-muted">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td></tr>
                                    ))}
                                    {((detailData?.services || detailData?.bookings || detailData?.reviews || []).length === 0) && (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>No data found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                        <div className="modal-actions"><button className="btn-secondary" onClick={() => setDetailModal(null)}>Close</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
