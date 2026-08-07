import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendeeApi } from '../../../api/attendee';
import './SubPage.css';

export default function PurchaseHistory() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user?.email) return;
        attendeeApi.getPurchases(user.email)
            .then(d => {
                setBookings(d.bookings || []);
                setTotalSpent(d.totalSpent || 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const filtered = bookings.filter(b =>
        !search ||
        (b.eventName || b.serviceName || '').toLowerCase().includes(search.toLowerCase())
    );

    const statusStyle = {
        paid: { background: '#dcfce7', color: '#16a34a' },
        pending: { background: '#fef3c7', color: '#d97706' },
        completed: { background: '#dbeafe', color: '#1d4ed8' },
        accepted: { background: '#dcfce7', color: '#16a34a' },
        rejected: { background: '#fee2e2', color: '#dc2626' },
    };

    return (
        <div>
            <div className="sp-header">
                <h1 className="sp-title">Purchase History</h1>
                <p className="sp-sub">Total spent: <strong>ETB {totalSpent.toLocaleString()}</strong></p>
            </div>

            <div style={{ marginBottom: 16 }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by event name..."
                    style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, width: '100%', maxWidth: 320, boxSizing: 'border-box', outline: 'none' }} />
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading purchases...</div>
            ) : filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                    <p style={{ margin: 0, fontSize: 15 }}>No purchase records found.</p>
                </div>
            ) : (
                <div className="sp-table-wrap">
                    <table className="sp-table">
                        <thead>
                            <tr>
                                <th>Event / Service</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((h, i) => {
                                const st = h.paymentStatus || h.status || 'pending';
                                const style = statusStyle[st] || statusStyle.pending;
                                return (
                                    <tr key={i}>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                                {h.eventName || h.serviceName || '—'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: 13 }}>{h.eventDate || '—'}</td>
                                        <td style={{ fontSize: 13 }}>{h.serviceName || '—'}</td>
                                        <td className="sp-amount">ETB {(h.amount || 0).toLocaleString()}</td>
                                        <td>
                                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, ...style }}>
                                                {st}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
