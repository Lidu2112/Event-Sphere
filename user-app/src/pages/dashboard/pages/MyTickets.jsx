import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendeeApi } from '../../../api/attendee';
import '../AttendeeDashboard.css';
import './SubPage.css';

export default function MyTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user?.email) return;
        setLoading(true);
        attendeeApi.getTickets(user.email)
            .then(d => setTickets(d.tickets || []))
            .catch(err => {
                console.error(err);
                setTickets([]);
            })
            .finally(() => setLoading(false));
    }, [user?.email]);

    const displayed = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

    return (
        <div>
            <div className="sp-header">
                <h1 className="sp-title">My Tickets</h1>
                <p className="sp-sub">
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} owned
                </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {['all', 'confirmed', 'used', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        style={{
                            padding: '6px 16px', borderRadius: 20, border: '1px solid',
                            borderColor: filter === s ? '#6366f1' : '#e2e8f0',
                            background: filter === s ? '#6366f1' : '#fff',
                            color: filter === s ? '#fff' : '#64748b',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading tickets...</div>
            ) : displayed.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
                    <p style={{ margin: 0, fontSize: 15 }}>No tickets found.</p>
                </div>
            ) : (
                <div className="sp-ticket-list">
                    {displayed.map((t, i) => (
                        <div key={i} className="sp-ticket">
                            <div className="sp-ticket-icon">🎟️</div>
                            <div className="sp-ticket-info">
                                <h3>{t.eventName || t.event || 'Event Ticket'}</h3>
                                <div className="sp-ticket-meta">
                                    {t.eventDate && <span>📅 {t.eventDate}</span>}
                                    {(t.venue || t.location) && <span>📍 {t.venue || t.location}</span>}
                                    {t.ticketType && <span>🎫 {t.ticketType}</span>}
                                </div>
                                <span className="sp-ticket-id">{t.ticketId}</span>
                            </div>
                            <div className="sp-ticket-right">
                                <div className="sp-ticket-qr">
                                    {t.qrCode
                                        ? <img src={t.qrCode} alt="QR Code" />
                                        : <div className="sp-ticket-qr-placeholder">📱</div>
                                    }
                                </div>
                                <span className={`sp-status ${t.status || 'confirmed'}`}>{t.status || 'confirmed'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
