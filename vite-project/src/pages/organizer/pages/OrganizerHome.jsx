import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, ActionButton, PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

export default function OrganizerHome() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const email = user?.email || '';

    const [stats, setStats] = useState({ totalEvents: 0, publishedEvents: 0, ticketsSold: 0, totalAttendees: 0, revenue: 0, staffMembers: 0, averageRating: '—' });
    const [events, setEvents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!email) return;
        Promise.all([
            organizerApi.getStats(email),
            organizerApi.getEvents(email),
            organizerApi.getTickets(email),
        ]).then(([s, ev, tk]) => {
            if (s.success) setStats(s.stats);
            if (ev.success) setEvents(ev.events.slice(0, 5));
            if (tk.success) setTickets(tk.tickets);
        }).catch(console.error).finally(() => setLoading(false));
    }, [email]);

    return (
        <div>
            <PageHeader title="Event Organizer Dashboard" subtitle="Manage your events and track performance" />

            <div className="stats-grid">
                <StatCard icon="🎪" label="Total Events" value={stats.totalEvents} color="#0ea5e9" />
                <StatCard icon="🎟️" label="Tickets Sold" value={stats.ticketsSold} color="#f59e0b" />
                <StatCard icon="👥" label="Attendees" value={stats.totalAttendees} color="#10b981" />
                <StatCard icon="💰" label="Revenue" value={`ETB ${(stats.revenue || 0).toLocaleString()}`} color="#10b981" />
                <StatCard icon="👷" label="Staff" value={stats.staffMembers} color="#64748b" />
                <StatCard icon="⭐" label="Avg Rating" value={stats.averageRating} color="#f59e0b" />
            </div>

            <SectionBox title="Quick Actions">
                <div className="actions-grid">
                    <ActionButton icon="➕" label="Create Event" color="#0ea5e9" onClick={() => navigate('/organizer/create')} />
                    <ActionButton icon="🎟️" label="Sell Tickets" color="#f59e0b" onClick={() => navigate('/organizer/tickets')} />
                    <ActionButton icon="👥" label="Attendees" color="#10b981" onClick={() => navigate('/organizer/attendees')} />
                    <ActionButton icon="👷" label="Invite Staff" color="#64748b" onClick={() => navigate('/organizer/staff')} />
                    <ActionButton icon="📊" label="Analytics" color="#6366f1" onClick={() => navigate('/organizer/analytics')} />
                </div>
            </SectionBox>

            <SectionBox title="My Events" action={<button className="btn-sm" onClick={() => navigate('/organizer/events')}>View All</button>}>
                {loading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
                ) : events.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No events yet. <button className="btn-sm" onClick={() => navigate('/organizer/create')}>Create your first event →</button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>{['Event', 'Date', 'Venue', 'Tickets Sold', 'Revenue', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {events.map(ev => {
                                    const sold = tickets.filter(t => t.eventTitle === ev.title).length;
                                    const revenue = tickets.filter(t => t.eventTitle === ev.title).reduce((s, t) => s + (t.amount || 0), 0);
                                    return (
                                        <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600 }}>{ev.title}</td>
                                            <td style={{ padding: '12px 10px', fontSize: '11px', color: '#94a3b8' }}>{ev.date}</td>
                                            <td style={{ padding: '12px 10px', fontSize: '11px', color: '#94a3b8' }}>{ev.venue}</td>
                                            <td style={{ padding: '12px 10px', fontSize: '12px' }}>{sold}</td>
                                            <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600, color: '#10b981' }}>ETB {revenue.toLocaleString()}</td>
                                            <td style={{ padding: '12px 10px' }}><span className={`status-badge ${ev.published ? 'active' : 'pending'}`}>{ev.published ? 'Published' : 'Draft'}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionBox>
        </div>
    );
}
