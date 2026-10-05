import { useState, useEffect } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

const ROLES = ['all', 'attendee', 'event-organizer', 'event-staff', 'vendor'];
const ROLE_LABELS = { attendee: 'Attendee', 'event-organizer': 'Event Organizer', 'event-staff': 'Event Staff', vendor: 'Vendor', admin: 'Admin' };

const EMPTY = { name: '', email: '', phone: '', role: 'attendee', password: '' };

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { load(); }, [filter, search]);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') params.role = filter;
            if (search) params.search = search;
            const data = await api.getUsers(params);
            setUsers(data.users);
        } catch { setUsers([]); }
        finally { setLoading(false); }
    }

    function openAdd() { setForm(EMPTY); setModal('add'); }
    function openEdit(u) { setForm({ name: u.name, email: u.email || '', phone: u.phone || '', role: u.role, password: '' }); setSelected(u); setModal('edit'); }
    function openView(u) { setSelected(u); setModal('view'); }
    function closeModal() { setModal(null); setSelected(null); setMsg(''); }

    async function handleSave() {
        if (!form.name) { setMsg('Name is required'); return; }
        setSaving(true);
        try {
            if (modal === 'add') {
                await api.createUser(form);
            } else {
                await api.updateUser(selected._id, form);
            }
            closeModal();
            load();
        } catch (e) { setMsg(e.message); }
        finally { setSaving(false); }
    }

    async function handleStatus(u, status) {
        if (!window.confirm(`${status === 'active' ? 'Activate' : 'Suspend'} ${u.name}?`)) return;
        await api.setUserStatus(u._id, status);
        load();
    }

    async function handleDelete(u) {
        if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
        await api.deleteUser(u._id);
        load();
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Manage Users</h2>
                    <p className="page-subtitle">View and manage all registered users</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>+ Add User</button>
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    className="table-search"
                    placeholder="🔍 Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
            </div>

            <div className="filter-tabs">
                {ROLES.map(r => (
                    <button key={r} className={filter === r ? 'active' : ''} onClick={() => setFilter(r)}>
                        {r === 'all' ? `All (${users.length})` : ROLE_LABELS[r] || r}
                    </button>
                ))}
            </div>

            <div className="table-box">
                {loading ? <p style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No users found</td></tr>
                            )}
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td className="td-bold">{u.name}</td>
                                    <td className="td-muted">{u.email || '—'}</td>
                                    <td className="td-muted">{u.phone || '—'}</td>
                                    <td><span className="role-badge">{ROLE_LABELS[u.role] || u.role}</span></td>
                                    <td className="td-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`status-badge ${u.status || 'active'}`}>{u.status || 'active'}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="action-btn" title="View" onClick={() => openView(u)}>👁️</button>
                                            <button className="action-btn" title="Edit" onClick={() => openEdit(u)}>✏️</button>
                                            {u.status === 'suspended'
                                                ? <button className="action-btn" title="Activate" onClick={() => handleStatus(u, 'active')}>✅</button>
                                                : <button className="action-btn" title="Suspend" onClick={() => handleStatus(u, 'suspended')}>🚫</button>}
                                            <button className="action-btn" title="Delete" onClick={() => handleDelete(u)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add / Edit Modal */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>{modal === 'add' ? 'Add New User' : 'Edit User'}</h3>
                        {msg && <div className="modal-error">{msg}</div>}
                        <div className="modal-form">
                            <label>Full Name *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                            <label>Email</label>
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" type="email" />
                            <label>Phone</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+251 91 000 0000" />
                            <label>Role</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            {modal === 'add' && <>
                                <label>Password</label>
                                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" />
                            </>}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : modal === 'add' ? 'Create User' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modal === 'view' && selected && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>User Details</h3>
                        <div className="view-detail-grid">
                            {[
                                ['Name', selected.name], ['Email', selected.email || '—'],
                                ['Phone', selected.phone || '—'], ['Role', ROLE_LABELS[selected.role] || selected.role],
                                ['Status', selected.status || 'active'], ['Provider', selected.provider],
                                ['Joined', new Date(selected.createdAt).toLocaleDateString()],
                            ].map(([k, v]) => (
                                <div key={k} className="view-detail-row">
                                    <span className="view-detail-key">{k}</span>
                                    <span className="view-detail-val">{v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>Close</button>
                            <button className="btn-primary" onClick={() => { openEdit(selected); }}>Edit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
