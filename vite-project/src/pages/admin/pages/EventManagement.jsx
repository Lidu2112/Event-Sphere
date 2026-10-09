import { useState, useEffect } from 'react';
import { apiUrl } from '../../../api/config';
import { api } from '../../../api/admin';
import './AdminPages.css';

const CATEGORIES = ['all', 'Concert', 'Conference', 'Sports', 'Exhibition', 'Workshop', 'Festival', 'Wedding', 'Food', 'Cultural', 'Networking', 'Seminar'];
const STATUSES = ['all', 'upcoming', 'completed', 'cancelled', 'hidden', 'featured'];

const EMPTY_FORM = { title: '', description: '', venue: '', date: '', time: '', capacity: '', ticketPrice: '', category: '', banner: '' };

export default function EventManagement() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [modal, setModal] = useState(null); // null | 'view' | 'edit'
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [actionId, setActionId] = useState(null);

    useEffect(() => { load(); }, [search, statusFilter, categoryFilter]);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (categoryFilter !== 'all') params.category = categoryFilter;
            const data = await api.getAdminEvents(params);
            setEvents(data.events || []);
        } catch { setEvents([]); }
        finally { setLoading(false); }
    }

    function openView(ev) { setSelected(ev); setModal('view'); }

    function openEdit(ev) {
        setForm({
            title: ev.title || '',
            description: ev.description || '',
            venue: ev.venue || '',
            date: ev.date || '',
            time: ev.time || '',
            capacity: ev.capacity || '',
            ticketPrice: ev.ticketPrice || '',
            category: ev.category || '',
            banner: ev.banner || '',
        });
        setSelected(ev);
        setModal('edit');
        setMsg('');
    }

    function closeModal() { setModal(null); setSelected(null); setMsg(''); }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.title || !form.venue || !form.date) { setMsg('Title, venue and date are required.'); return; }
        setSaving(true);
        try {
            await api.updateAdminEvent(selected._id || selected.id, form);
            closeModal();
            load();
        } catch (err) { setMsg(err.message); }
        finally { setSaving(false); }
    }

    async function doAction(fn, ev) {
        if (actionId) return;
        setActionId(ev._id || ev.id);
        try { await fn(ev._id || ev.id); await load(); }
        catch (err) { alert(err.message); }
        finally { setActionId(null); }
    }

    async function handleDelete(ev) {
        if (!window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
        doAction(api.deleteAdminEvent, ev);
    }

    const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Event Management</h2>
                    <p className="page-subtitle">{events.length} events — manage, edit, cancel, hide or feature</p>
                </div>
                <button className="btn-primary" onClick={load}>↻ Refresh</button>
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    className="table-search"
                    placeholder="🔍 Search event name, venue or organizer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 220 }}
                />
                <select className="table-search" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 160 }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                </select>
            </div>

            {/* Status tabs */}
            <div className="filter-tabs">
                {STATUSES.map(s => (
                    <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => setStatusFilter(s)}>
                        {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="table-box">
                {loading ? (
                    <p style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading events...</p>
                ) : events.length === 0 ? (
                    <p style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No events found.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Organizer</th>
                                <th>Category</th>
                                <th>Venue</th>
                                <th>Date</th>
                                <th>Tickets Sold</th>
                                <th>Revenue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(ev => {
                                const id = ev._id || ev.id;
                                const statusLabel = ev.status === 'cancelled' ? 'cancelled'
                                    : ev.hidden ? 'hidden'
                                        : ev.featured ? 'featured'
                                            : ev.published ? 'active'
                                                : 'draft';
                                return (
                                    <tr key={id}>
                                        <td className="td-bold" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {ev.featured && <span title="Featured" style={{ marginRight: 4 }}>⭐</span>}
                                            {ev.hidden && <span title="Hidden" style={{ marginRight: 4 }}>🙈</span>}
                                            {ev.title}
                                        </td>
                                        <td className="td-muted">{ev.organizerEmail || '—'}</td>
                                        <td><span className="role-badge">{ev.category || '—'}</span></td>
                                        <td className="td-muted">{ev.venue || '—'}</td>
                                        <td className="td-muted">{ev.date || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{ev.ticketsSold ?? 0}</td>
                                        <td style={{ fontWeight: 600, color: '#10b981' }}>ETB {(ev.revenue || 0).toLocaleString()}</td>
                                        <td><span className={`status-badge ${statusLabel}`}>{statusLabel}</span></td>
                                        <td>
                                            <div className="action-btns" style={{ flexWrap: 'wrap', gap: 3 }}>
                                                <button className="action-btn" title="View" onClick={() => openView(ev)}>👁️</button>
                                                <button className="action-btn" title="Edit" onClick={() => openEdit(ev)}>✏️</button>
                                                <button className="action-btn" title={ev.featured ? 'Unfeature' : 'Feature'} onClick={() => doAction(api.featureAdminEvent, ev)} disabled={actionId === id}>
                                                    {ev.featured ? '★' : '☆'}
                                                </button>
                                                <button className="action-btn" title={ev.hidden ? 'Unhide' : 'Hide'} onClick={() => doAction(api.hideAdminEvent, ev)} disabled={actionId === id}>
                                                    {ev.hidden ? '👁️' : '🙈'}
                                                </button>
                                                <button className="action-btn" title="Cancel" onClick={() => { if (window.confirm(`Cancel "${ev.title}"?`)) doAction(api.cancelAdminEvent, ev); }} disabled={actionId === id || ev.status === 'cancelled'}>
                                                    🚫
                                                </button>
                                                <button className="action-btn" title="Delete" onClick={() => handleDelete(ev)} disabled={actionId === id} style={{ color: '#ef4444' }}>
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* View Modal */}
            {modal === 'view' && selected && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <h3>Event Details</h3>
                        {selected.banner && (
                            <img src={selected.banner.startsWith('http') ? selected.banner : apiUrl(selected.banner)}
                                alt={selected.title}
                                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }}
                                onError={e => e.target.style.display = 'none'} />
                        )}
                        <div className="view-detail-grid">
                            {[
                                ['Title', selected.title],
                                ['Organizer', selected.organizerEmail || '—'],
                                ['Category', selected.category || '—'],
                                ['Venue', selected.venue || '—'],
                                ['Date', selected.date || '—'],
                                ['Time', selected.time || '—'],
                                ['Price', selected.ticketPrice === 0 ? 'Free' : `ETB ${selected.ticketPrice}`],
                                ['Capacity', selected.capacity || '—'],
                                ['Tickets Sold', String(selected.ticketsSold ?? 0)],
                                ['Revenue', `ETB ${(selected.revenue || 0).toLocaleString()}`],
                                ['Published', selected.published ? 'Yes' : 'No'],
                                ['Featured', selected.featured ? 'Yes' : 'No'],
                                ['Hidden', selected.hidden ? 'Yes' : 'No'],
                            ].map(([k, v]) => (
                                <div key={k} className="view-detail-row">
                                    <span className="view-detail-key">{k}</span>
                                    <span className="view-detail-val">{v}</span>
                                </div>
                            ))}
                        </div>
                        {selected.description && (
                            <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>DESCRIPTION</p>
                                <p style={{ fontSize: 13, color: '#334155', whiteSpace: 'pre-wrap' }}>{selected.description}</p>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>Close</button>
                            <button className="btn-primary" onClick={() => openEdit(selected)}>✏️ Edit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {modal === 'edit' && selected && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>Edit Event — {selected.title}</h3>
                        {msg && <div className="modal-error">{msg}</div>}
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Title *</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inp} />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Venue *</label>
                                <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required style={inp} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Date *</label>
                                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={inp} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Time</label>
                                    <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inp} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Ticket Price (ETB)</label>
                                    <input type="number" min="0" value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: e.target.value })} style={inp} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Capacity</label>
                                    <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={inp} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Banner URL</label>
                                <input value={form.banner} onChange={e => setForm({ ...form, banner: e.target.value })} placeholder="https://... or /uploads/..." style={inp} />
                            </div>
                            <div className="modal-actions" style={{ marginTop: 8 }}>
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
