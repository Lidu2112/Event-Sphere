import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

const STAFF_ROLES = ['Entrance Staff', 'Ticket Checker', 'Registration Desk', 'Volunteer'];

export default function InviteStaff() {
    const { user } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', role: STAFF_ROLES[0] });
    const [modal, setModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [msg, setMsg] = useState(null);

    useEffect(() => { if (user?.email) load(); }, [user]);

    async function load() {
        setLoading(true);
        try {
            const d = await organizerApi.getStaff(user.email);
            setStaff(d.staff || []);
        } catch { setStaff([]); }
        finally { setLoading(false); }
    }

    // Invite just records locally (no send-email endpoint yet)
    function handleInvite(e) {
        e.preventDefault();
        if (!form.name || !form.email) { setMsg({ ok: false, text: 'Name and email are required.' }); return; }
        setMsg({ ok: true, text: `Invitation recorded for ${form.name}. Connect an email endpoint to send invites.` });
        setForm({ name: '', email: '', role: STAFF_ROLES[0] });
        setModal(false);
        setTimeout(() => setMsg(null), 4000);
    }

    return (
        <div>
            <PageHeader
                title="Invite Staff"
                subtitle={`${staff.length} registered staff members — from MongoDB`}
                action={<button className="btn-primary" onClick={() => { setModal(true); setMsg(null); }}>+ Invite Staff</button>}
            />
            {msg && (
                <div style={{ padding: '11px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626' }}>
                    {msg.text}
                </div>
            )}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', marginBottom: 20 }}>
                {[
                    { label: 'Total Staff', value: staff.length, color: '#6366f1' },
                    { label: 'Active', value: staff.filter(s => s.status === 'active').length, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="scard" style={{ borderTopColor: s.color }}>
                        <div className="scard-value">{s.value}</div>
                        <div className="scard-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <SectionBox title="Staff Members">
                {loading ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading staff...</div>
                ) : staff.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No staff with role "event-staff" registered yet.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>{['Name', 'Email', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {staff.map(s => (
                                <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px' }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                                    </td>
                                    <td style={{ padding: '12px 10px', fontSize: 12, color: '#64748b' }}>{s.email}</td>
                                    <td style={{ padding: '12px 10px' }}><span className={`status-badge ${s.status}`}>{s.status}</span></td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <button className="btn-sm" onClick={() => setSelected(s)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </SectionBox>

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <h3 style={{ marginBottom: 12 }}>Invite Staff Member</h3>
                        <form onSubmit={handleInvite} style={{ display: 'grid', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 12 }}>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 12 }}>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 12 }}>Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                                    {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Send Invitation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <h3 style={{ marginBottom: 12 }}>{selected.name}</h3>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <div><strong>Email:</strong> {selected.email}</div>
                            <div><strong>Phone:</strong> {selected.phone || '—'}</div>
                            <div><strong>Status:</strong> {selected.status}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
