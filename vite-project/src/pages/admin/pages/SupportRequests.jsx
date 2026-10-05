import { useState, useEffect } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

const STATUS_COLORS = { open: '#f59e0b', 'in-progress': '#0ea5e9', resolved: '#10b981', closed: '#94a3b8' };
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#f59e0b', high: '#ef4444', urgent: '#7c3aed' };

export default function SupportRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => { load(); }, [statusFilter, search]);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const data = await api.getSupport(params);
            setRequests(data.requests);
        } catch { setRequests([]); }
        finally { setLoading(false); }
    }

    async function openDetail(r) {
        try {
            const data = await api.getSupportById(r._id);
            setSelected(data.request);
        } catch { setSelected(r); }
        setReplyText('');
    }

    async function handleStatusChange(id, status) {
        await api.setSupportStatus(id, status);
        if (selected?._id === id) setSelected({ ...selected, status });
        load();
    }

    async function handleClose(id) {
        if (!window.confirm('Close this request?')) return;
        await api.closeSupport(id);
        if (selected?._id === id) setSelected(null);
        load();
    }

    async function handleReply() {
        if (!replyText.trim()) return;
        setReplying(true);
        try {
            const data = await api.replySupport(selected._id, replyText);
            setSelected(data.request);
            setReplyText('');
            load();
        } finally { setReplying(false); }
    }

    const counts = {
        all: requests.length,
        open: requests.filter(r => r.status === 'open').length,
        'in-progress': requests.filter(r => r.status === 'in-progress').length,
        resolved: requests.filter(r => r.status === 'resolved').length,
        closed: requests.filter(r => r.status === 'closed').length,
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Support Requests</h2>
                    <p className="page-subtitle">Handle user issues and support tickets</p>
                </div>
                <div className="badge-count" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    {counts.open} open
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 14 }}>
                <input
                    className="table-search"
                    placeholder="🔍 Search by name, request ID, or subject..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', maxWidth: 440 }}
                />
            </div>

            {/* Status filter tabs */}
            <div className="filter-tabs" style={{ marginBottom: 20 }}>
                {['all', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
                    <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => setStatusFilter(s)}>
                        {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] || 0})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="table-box">
                {loading ? (
                    <p style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading...</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>User</th>
                                <th>Role</th>
                                <th>Subject</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No support requests found</td></tr>
                            )}
                            {requests.map(r => (
                                <tr key={r._id}>
                                    <td className="td-mono">{r.requestId}</td>
                                    <td>
                                        <div>
                                            <div className="td-bold">{r.userName}</div>
                                            <div className="td-muted">{r.userEmail}</div>
                                        </div>
                                    </td>
                                    <td><span className="role-badge">{r.userRole || 'attendee'}</span></td>
                                    <td className="td-bold">{r.subject}</td>
                                    <td>
                                        <span className="status-badge" style={{ background: PRIORITY_COLORS[r.priority] + '20', color: PRIORITY_COLORS[r.priority] }}>
                                            {r.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ background: STATUS_COLORS[r.status] + '20', color: STATUS_COLORS[r.status] }}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="td-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="action-btn" title="View & Reply" onClick={() => openDetail(r)}>👁️</button>
                                            {r.status !== 'resolved' && (
                                                <button className="action-btn" title="Mark Resolved" onClick={() => handleStatusChange(r._id, 'resolved')}>✅</button>
                                            )}
                                            {r.status !== 'closed' && (
                                                <button className="action-btn" title="Close Request" onClick={() => handleClose(r._id)}>🔒</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail / Reply Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ marginBottom: 4 }}>{selected.subject}</h3>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>{selected.requestId} · {selected.userName} · {selected.userEmail}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <span className="status-badge" style={{ background: PRIORITY_COLORS[selected.priority] + '20', color: PRIORITY_COLORS[selected.priority] }}>
                                    {selected.priority}
                                </span>
                                <span className="status-badge" style={{ background: STATUS_COLORS[selected.status] + '20', color: STATUS_COLORS[selected.status] }}>
                                    {selected.status}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                            {selected.description}
                        </div>

                        {/* Change status */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', alignSelf: 'center' }}>Change Status:</span>
                            {['open', 'in-progress', 'resolved', 'closed'].map(s => (
                                <button
                                    key={s}
                                    className="btn-secondary"
                                    style={selected.status === s ? { background: STATUS_COLORS[s] + '20', color: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] + '40' } : {}}
                                    onClick={() => handleStatusChange(selected._id, s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Replies thread */}
                        {selected.replies?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>CONVERSATION</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                                    {selected.replies.map((rep, i) => (
                                        <div key={i} style={{
                                            padding: '10px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                                            background: rep.from === 'Admin' ? '#eef2ff' : '#f8fafc',
                                            alignSelf: rep.from === 'Admin' ? 'flex-end' : 'flex-start',
                                            maxWidth: '85%',
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: rep.from === 'Admin' ? '#6366f1' : '#64748b', marginBottom: 4 }}>
                                                {rep.from} · {new Date(rep.createdAt).toLocaleString()}
                                            </div>
                                            {rep.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reply box */}
                        {selected.status !== 'closed' && (
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>REPLY TO USER</div>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={3}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                                />
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            {selected.status !== 'closed' && (
                                <button className="btn-primary" onClick={handleReply} disabled={replying || !replyText.trim()}>
                                    {replying ? 'Sending...' : '📨 Send Reply'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
