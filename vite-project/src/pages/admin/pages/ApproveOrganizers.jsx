import { useState, useEffect } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

const STATIC_ORGANIZERS = [
    { _id: '1', name: 'Yonas Bekele', email: 'yonas@email.com', company: 'Addis Events Co.', submitted: 'Jun 24, 2026', doc: 'license.pdf', status: 'pending' },
    { _id: '2', name: 'Hana Kebede', email: 'hana@email.com', company: 'Ethiopian Cultural Events', submitted: 'Jun 23, 2026', doc: 'permit.pdf', status: 'pending' },
];

export default function ApproveOrganizers() {
    const [organizers, setOrganizers] = useState(STATIC_ORGANIZERS);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [detailModal, setDetailModal] = useState(null); // null | 'events' | 'revenue'
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionId, setActionId] = useState(null);

    useEffect(() => { loadOrganizers(); }, [statusFilter]);

    async function loadOrganizers() {
        try {
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const data = await api.getOrganizers(params);
            const enriched = data.organizers.map(o => ({
                ...o,
                company: o.company || o.organization || '—',
                submitted: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
                doc: o.doc || 'document.pdf',
            }));
            if (enriched.length > 0) setOrganizers(enriched);
        } catch { /* keep static */ }
    }

    async function handleApprove(o) {
        if (!window.confirm(`Approve ${o.name}?`)) return;
        setActionId(o._id);
        try { await api.approveOrganizer(o._id); loadOrganizers(); }
        catch { setOrganizers(os => os.map(x => x._id === o._id ? { ...x, status: 'active' } : x)); }
        finally { setActionId(null); }
    }

    async function handleReject(o) {
        if (!window.confirm(`Reject ${o.name}?`)) return;
        setActionId(o._id);
        try { await api.rejectOrganizer(o._id); loadOrganizers(); }
        catch { setOrganizers(os => os.map(x => x._id === o._id ? { ...x, status: 'rejected' } : x)); }
        finally { setActionId(null); }
    }

    async function handleSuspend(o) {
        if (!window.confirm(`Suspend ${o.name}?`)) return;
        setActionId(o._id);
        try { await api.suspendOrganizer(o._id); loadOrganizers(); }
        finally { setActionId(null); }
    }

    async function handleActivate(o) {
        if (!window.confirm(`Activate ${o.name}?`)) return;
        setActionId(o._id);
        try { await api.activateOrganizer(o._id); loadOrganizers(); }
        finally { setActionId(null); }
    }

    async function viewEvents(o) {
        setDetailLoading(true);
        setDetailModal('events');
        setDetailData(null);
        try { const d = await api.getOrganizerEvents(o._id); setDetailData(d); }
        catch { setDetailData({ events: [], error: 'Failed to load' }); }
        finally { setDetailLoading(false); }
    }

    async function viewRevenue(o) {
        setDetailLoading(true);
        setDetailModal('revenue');
        setDetailData(null);
        try { const d = await api.getOrganizerRevenue(o._id); setDetailData(d); }
        catch { setDetailData({ error: 'Failed to load' }); }
        finally { setDetailLoading(false); }
    }

    const filtered = statusFilter === 'all' ? organizers : organizers.filter(o => o.status === statusFilter);
    const pendingCount = organizers.filter(o => o.status === 'pending' || !o.status).length;

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Approve Event Organizers</h2>
                    <p className="page-subtitle">Review and manage event organizer accounts</p>
                </div>
                <div className="badge-count">{pendingCount} pending</div>
            </div>

            <div className="filter-tabs">
                {['all', 'pending', 'active', 'rejected', 'suspended'].map(s => (
                    <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => setStatusFilter(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            <div className="approval-grid">
                {filtered.length === 0 && (
                    <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No organizers found</p>
                )}
                {filtered.map(o => (
                    <div key={o._id} className="approval-card">
                        <div className="approval-header">
                            <div className="approval-avatar">🧑</div>
                            <div className="approval-info">
                                <div className="approval-name">{o.name}</div>
                                <div className="approval-company">{o.company}</div>
                            </div>
                            <span className={`status-badge ${o.status || 'pending'}`}>{o.status || 'pending'}</span>
                        </div>

                        <div className="approval-details">
                            <div className="approval-row"><span className="label-icon">✉️</span><span>{o.email}</span></div>
                            <div className="approval-row"><span className="label-icon">📅</span><span>Submitted {o.submitted}</span></div>
                            <div className="approval-row"><span className="label-icon">📎</span><a href="#" className="doc-link" onClick={e => e.preventDefault()}>{o.doc}</a></div>
                        </div>

                        <div className="approval-actions" style={{ flexWrap: 'wrap' }}>
                            <button className="btn-secondary" onClick={() => setSelected(o)}>👁️ Details</button>
                            <button className="btn-secondary" onClick={() => viewEvents(o)}>📅 Events</button>
                            <button className="btn-secondary" onClick={() => viewRevenue(o)}>💰 Revenue</button>
                            {(o.status === 'pending' || !o.status) && (
                                <>
                                    <button className="btn-approve" onClick={() => handleApprove(o)} disabled={actionId === o._id}>✅ Approve</button>
                                    <button className="btn-reject" onClick={() => handleReject(o)} disabled={actionId === o._id}>❌ Reject</button>
                                </>
                            )}
                            {o.status === 'active' && (
                                <button className="btn-secondary" style={{ color: '#dc2626' }} onClick={() => handleSuspend(o)} disabled={actionId === o._id}>🚫 Suspend</button>
                            )}
                            {o.status === 'suspended' && (
                                <button className="btn-approve" onClick={() => handleActivate(o)} disabled={actionId === o._id}>✅ Activate</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* View Details Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Organizer Details</h3>
                        <div className="view-detail-grid">
                            {[['Name', selected.name], ['Company', selected.company || '—'], ['Email', selected.email], ['Phone', selected.phone || '—'], ['Submitted', selected.submitted], ['Status', selected.status || 'pending']].map(([k, v]) => (
                                <div key={k} className="view-detail-row">
                                    <span className="view-detail-key">{k}</span>
                                    <span className="view-detail-val">{k === 'Status' ? <span className={`status-badge ${selected.status || 'pending'}`}>{v}</span> : v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Events / Revenue Modal */}
            {detailModal && (
                <div className="modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '85vh', overflowY: 'auto' }}>
                        <h3>{detailModal === 'events' ? '📅 Organizer Events' : '💰 Revenue Summary'}</h3>
                        {detailLoading ? <p style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>Loading...</p> : detailData?.error ? (
                            <p style={{ color: '#ef4444' }}>{detailData.error}</p>
                        ) : detailModal === 'events' ? (
                            <table className="data-table">
                                <thead><tr><th>Title</th><th>Date</th><th>Status</th><th>Capacity</th></tr></thead>
                                <tbody>
                                    {(detailData?.events || []).length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>No events</td></tr>
                                    ) : (detailData?.events || []).map(ev => (
                                        <tr key={ev._id}><td className="td-bold">{ev.title}</td><td className="td-muted">{ev.date}</td><td><span className={`status-badge ${ev.published ? 'active' : 'pending'}`}>{ev.published ? 'Published' : 'Draft'}</span></td><td>{ev.capacity}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div>
                                <p style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>ETB {(detailData?.revenue || 0).toLocaleString()}</p>
                                <p style={{ color: '#64748b' }}>{detailData?.ticketCount || 0} tickets sold for {detailData?.organizer?.name}</p>
                            </div>
                        )}
                        <div className="modal-actions"><button className="btn-secondary" onClick={() => setDetailModal(null)}>Close</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
