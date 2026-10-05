import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

export default function ManageAttendees() {
    const { user } = useAuth();
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [checkingIn, setCheckingIn] = useState(null);

    useEffect(() => { if (user?.email) load(); }, [user]);

    async function load(s = '') {
        setLoading(true);
        try {
            const d = await organizerApi.getAttendees(user.email, s);
            setAttendees(d.attendees || []);
        } catch { setAttendees([]); }
        finally { setLoading(false); }
    }

    function handleSearch(v) { setSearch(v); load(v); }

    async function handleCheckIn(ticketId) {
        setCheckingIn(ticketId);
        try {
            const d = await organizerApi.checkInAttendee(ticketId);
            setAttendees(prev => prev.map(a => a._id === ticketId ? d.ticket : a));
        } catch (e) { alert(e.message); }
        finally { setCheckingIn(null); }
    }

    const checkedIn = attendees.filter(a => a.checkedIn).length;

    return (
        <div>
            <PageHeader title="Manage Attendees" subtitle="View and check in attendees — from MongoDB" />
            <div className="stats-grid" style={{ marginBottom: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
                {[
                    { label: 'Total Attendees', value: attendees.length, color: '#0ea5e9' },
                    { label: 'Checked In', value: checkedIn, color: '#10b981' },
                    { label: 'Not Yet', value: attendees.length - checkedIn, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className="scard" style={{ borderTopColor: s.color }}>
                        <div className="scard-value">{s.value}</div>
                        <div className="scard-label">{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ marginBottom: 14 }}>
                <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by name, email, or ticket ID..." style={{ width: '100%', maxWidth: 360, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
            </div>
            <SectionBox>
                {loading ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading attendees...</div>
                ) : attendees.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No attendees found.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>{['Name', 'Email', 'Event', 'Ticket ID', 'Check-in Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {attendees.map(a => (
                                <tr key={a._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600 }}>{a.userName}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '11px', color: '#94a3b8' }}>{a.userEmail}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '11px' }}>{a.eventTitle}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '11px', fontFamily: 'monospace', color: '#6366f1' }}>{a.ticketCode || a.txRef}</td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <span className={`status-badge ${a.checkedIn ? 'active' : 'pending'}`}>
                                            {a.checkedIn ? `✓ Checked In ${a.checkedInAt ? new Date(a.checkedInAt).toLocaleTimeString() : ''}` : 'Not Checked In'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 10px' }}>
                                        {!a.checkedIn && (
                                            <button className="btn-sm" disabled={checkingIn === a._id} onClick={() => handleCheckIn(a._id)}>
                                                {checkingIn === a._id ? '...' : 'Check In'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </SectionBox>
        </div>
    );
}
