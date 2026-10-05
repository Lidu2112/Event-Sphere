import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, ActionButton, PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';

const BASE = 'http://localhost:5000/api/attendee';

export default function AttendeeHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id || user?._id;
    const email = user?.email || '';

    const [stats, setStats] = useState({ tickets: 0, upcoming: 0, favorites: 0, totalSpent: 0 });
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!email) return;
        Promise.all([
            fetch(`${BASE}/stats?userId=${encodeURIComponent(userId || '')}&userEmail=${encodeURIComponent(email)}`).then(r => r.json()),
            fetch(`${BASE}/tickets?userEmail=${encodeURIComponent(email)}`).then(r => r.json()),
        ]).then(([s, t]) => {
            if (s.success) setStats(s.stats);
            if (t.success) setTickets(t.tickets.slice(0, 3));
        }).catch(console.error).finally(() => setLoading(false));
    }, [email, userId]);

    return (
        <div>
            <PageHeader title="Attendee Dashboard" subtitle="Browse events and manage your tickets" />
            <div className="stats-grid">
                <StatCard icon="🎟️" label="My Tickets" value={loading ? '...' : stats.tickets} color="#f59e0b" />
                <StatCard icon="📅" label="Upcoming Events" value={loading ? '...' : stats.upcoming} color="#0ea5e9" />
                <StatCard icon="💰" label="Total Spent" value={loading ? '...' : `ETB ${(stats.totalSpent || 0).toLocaleString()}`} color="#10b981" />
                <StatCard icon="❤️" label="Favorites" value={loading ? '...' : stats.favorites} color="#ec4899" />
            </div>

            <SectionBox title="Quick Actions">
                <div className="actions-grid">
                    <ActionButton icon="🔍" label="Browse Events" color="#f59e0b" onClick={() => navigate('/attendee/browse')} />
                    <ActionButton icon="🎟️" label="My Tickets" color="#0ea5e9" onClick={() => navigate('/attendee/tickets')} />
                    <ActionButton icon="📋" label="History" color="#64748b" onClick={() => navigate('/attendee/history')} />
                    <ActionButton icon="⭐" label="Review" color="#ec4899" onClick={() => navigate('/attendee/reviews')} />
                </div>
            </SectionBox>

            <SectionBox title="My Recent Tickets">
                {loading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No tickets yet. <button className="btn-sm" onClick={() => navigate('/attendee/browse')}>Browse events →</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {tickets.map((t, i) => (
                            <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.eventName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{t.eventDate} • {t.venue || '—'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: '#6366f1', fontFamily: 'monospace', fontWeight: 600 }}>{t.ticketId}</div>
                                    <span className="status-badge active" style={{ marginTop: 4, display: 'inline-block' }}>confirmed</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>
        </div>
    );
}
