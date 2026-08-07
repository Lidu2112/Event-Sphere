import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';

export default function MyTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        fetch(`http://localhost:5000/api/attendee/tickets?userEmail=${encodeURIComponent(user.email)}`)
            .then(r => r.json())
            .then(d => setTickets(d.tickets || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div>
            <PageHeader title="My Digital Tickets" subtitle={`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} — from MongoDB`} />
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🎟️</div>
                    <p style={{ margin: 0 }}>No tickets yet. Buy a ticket from the Browse Events page.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {tickets.map((t, i) => (
                        <SectionBox key={i}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.eventName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>📅 {t.eventDate}</div>
                            {t.venue && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>📍 {t.venue}</div>}
                            {t.qrCode ? (
                                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', marginBottom: 12 }}>
                                    <img src={t.qrCode} alt="QR" style={{ width: 120, height: 120 }} />
                                </div>
                            ) : (
                                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, textAlign: 'center', marginBottom: 12, color: '#94a3b8', fontSize: 12 }}>QR Code</div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 11, color: '#6366f1', fontFamily: 'monospace', fontWeight: 600 }}>{t.ticketId}</div>
                                <span className="status-badge active">confirmed</span>
                            </div>
                        </SectionBox>
                    ))}
                </div>
            )}
        </div>
    );
}
