import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

export default function SellTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        organizerApi.getTickets(user.email)
            .then(d => setTickets(d.tickets || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const paid = tickets.filter(t => t.status === 'paid');
    const revenue = paid.reduce((s, t) => s + (t.amount || 0), 0);

    return (
        <div>
            <PageHeader title="Ticket Sales" subtitle="All paid tickets for your events — from MongoDB" />
            <div className="stats-grid" style={{ marginBottom: 18 }}>
                {[
                    { label: 'Tickets Sold', value: paid.length, color: '#f59e0b' },
                    { label: 'Revenue', value: `ETB ${revenue.toLocaleString()}`, color: '#10b981' },
                    { label: 'Total Tickets', value: tickets.length, color: '#0ea5e9' },
                ].map(s => (
                    <div key={s.label} className="scard" style={{ borderTopColor: s.color }}>
                        <div className="scard-value">{s.value}</div>
                        <div className="scard-label">{s.label}</div>
                    </div>
                ))}
            </div>
            <SectionBox title="Ticket Sales Overview">
                {loading ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No tickets sold yet.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>{['Ticket ID', 'Event', 'Attendee', 'Amount', 'Date', 'Status'].map(h => (
                                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', fontSize: '11px', fontFamily: 'monospace', color: '#6366f1' }}>{t.ticketCode || t.txRef}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600 }}>{t.eventTitle}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px' }}>{t.userName}<br /><span style={{ fontSize: 11, color: '#94a3b8' }}>{t.userEmail}</span></td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600, color: '#10b981' }}>ETB {(t.amount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '11px', color: '#94a3b8' }}>{t.eventDate}</td>
                                    <td style={{ padding: '12px 10px' }}><span className={`status-badge ${t.status === 'paid' ? 'active' : t.status}`}>{t.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </SectionBox>
        </div>
    );
}
