import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

const STATUS_STYLE = {
    accepted: { bg: '#dcfce7', color: '#16a34a' },
    rejected: { bg: '#fee2e2', color: '#dc2626' },
    pending: { bg: '#fef3c7', color: '#d97706' },
    completed: { bg: '#dbeafe', color: '#1d4ed8' },
};

export default function BookingRequests() {
    const { user } = useAuth();
    const email = user?.email || '';

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [detail, setDetail] = useState(null);  // selected booking for view detail modal
    const [updating, setUpdating] = useState(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => { if (email) load(); }, [email]);

    async function load() {
        setLoading(true);
        try { const d = await vendorApi.getBookings(email); setBookings(d.bookings || []); }
        catch { setBookings([]); }
        finally { setLoading(false); }
    }

    async function updateStatus(id, status) {
        setUpdating(id);
        try {
            const d = await vendorApi.updateBookingStatus(id, status);
            setBookings(bs => bs.map(b => b._id === id ? d.booking : b));
            if (detail?._id === id) setDetail(d.booking);
        } catch (e) { alert(e.message); }
        finally { setUpdating(null); }
    }

    async function sendMessage(id) {
        if (!message.trim()) return;
        setSending(true);
        try {
            const d = await vendorApi.addBookingMessage(id, message.trim());
            setBookings(bs => bs.map(b => b._id === id ? d.booking : b));
            if (detail?._id === id) setDetail(d.booking);
            setMessage('');
        } catch (e) { alert(e.message); }
        finally { setSending(false); }
    }

    async function markCompleted(id) {
        try {
            const d = await vendorApi.completeBooking(id);
            setBookings(bs => bs.map(b => b._id === id ? d.booking : b));
            if (detail?._id === id) setDetail(d.booking);
        } catch (e) { alert(e.message); }
    }

    async function markPaid(id) {
        try {
            const d = await vendorApi.payBooking(id);
            setBookings(bs => bs.map(b => b._id === id ? d.booking : b));
            if (detail?._id === id) setDetail(d.booking);
        } catch (e) { alert(e.message); }
    }

    const displayed = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    return (
        <div>
            <PageHeader title="Booking Requests" subtitle="Accept or reject incoming service bookings — from MongoDB" />

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['all', 'pending', 'accepted', 'rejected', 'completed'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{
                        padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12,
                        background: filter === s ? '#6366f1' : '#f1f5f9',
                        color: filter === s ? '#fff' : '#64748b',
                    }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length})
                    </button>
                ))}
            </div>

            <SectionBox>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading from MongoDB...</div>
                ) : displayed.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No booking requests found</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    {['Event', 'Service', 'Client', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map(r => {
                                    const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                                    return (
                                        <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 10px', fontSize: 12, fontWeight: 600 }}>{r.eventName}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 11, color: '#64748b' }}>{r.serviceName}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 12 }}>{r.clientName}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 11, color: '#94a3b8' }}>{r.eventDate}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 12, fontWeight: 700, color: '#10b981' }}>ETB {r.amount?.toLocaleString()}</td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color }}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    {/* View Detail */}
                                                    <button onClick={() => setDetail(r)} style={{ padding: '4px 8px', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                                        👁️ View
                                                    </button>
                                                    {r.status === 'pending' && (
                                                        <>
                                                            <button disabled={updating === r._id} onClick={() => updateStatus(r._id, 'accepted')} style={{ padding: '4px 8px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                                                ✅ Accept
                                                            </button>
                                                            <button disabled={updating === r._id} onClick={() => updateStatus(r._id, 'rejected')} style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                                                ❌ Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {r.status === 'accepted' && (
                                                        <button disabled={updating === r._id} onClick={() => updateStatus(r._id, 'completed')} style={{ padding: '4px 8px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                                            🏁 Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionBox>

            {/* View Detail Modal */}
            {detail && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setDetail(null)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Booking Details</h3>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 20 }}>ID: {detail._id}</p>
                        {[
                            ['Event', detail.eventName],
                            ['Event Date', detail.eventDate],
                            ['Service', detail.serviceName],
                            ['Client', detail.clientName],
                            ['Client Email', detail.clientEmail],
                            ['Amount', `ETB ${detail.amount?.toLocaleString()}`],
                            ['Status', detail.status],
                            ['Payment', detail.paymentStatus],
                            ['Notes', detail.notes || '—'],
                        ].map(([k, v]) => {
                            const st = STATUS_STYLE[v];
                            return (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{k}</span>
                                    {st
                                        ? <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color }}>{v}</span>
                                        : <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', textAlign: 'right', maxWidth: 260 }}>{v}</span>
                                    }
                                </div>
                            );
                        })}
                        <div style={{ marginTop: 18 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Conversation</div>
                            <div style={{ maxHeight: 170, overflowY: 'auto', background: '#f8fafc', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                                {(detail.messages || []).length === 0 ? (
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>No messages yet. Send a quick note to the organizer.</div>
                                ) : (detail.messages || []).map((m, i) => (
                                    <div key={i} style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 8, background: m.sender === 'vendor' ? '#dbeafe' : '#fff', fontSize: 12 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 2, color: '#334155' }}>{m.sender === 'vendor' ? 'Vendor' : 'Organizer'}</div>
                                        <div>{m.text}</div>
                                    </div>
                                ))}
                            </div>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Write a message to the organizer..." style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, fontSize: 12, resize: 'vertical' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                <button onClick={() => sendMessage(detail._id)} disabled={sending} style={{ padding: '8px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-sm" onClick={() => setDetail(null)}>Close</button>
                                    {detail.status === 'pending' && (
                                        <>
                                            <button onClick={() => updateStatus(detail._id, 'accepted')} style={{ padding: '8px 14px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>✅ Accept</button>
                                            <button onClick={() => updateStatus(detail._id, 'rejected')} style={{ padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>❌ Reject</button>
                                        </>
                                    )}
                                    {detail.status === 'accepted' && (
                                        <button onClick={() => markCompleted(detail._id)} style={{ padding: '8px 14px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>🏁 Complete</button>
                                    )}
                                    {detail.status === 'completed' && detail.paymentStatus !== 'paid' && (
                                        <button onClick={() => markPaid(detail._id)} style={{ padding: '8px 14px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>💳 Mark Paid</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
