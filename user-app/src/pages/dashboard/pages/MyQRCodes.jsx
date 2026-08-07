import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendeeApi } from '../../../api/attendee';
import '../AttendeeDashboard.css';
import './SubPage.css';

// deterministic mini-QR pattern from ticket id string
function buildQR(seed) {
    const hash = [...(seed || 'x')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
    return Array.from({ length: 49 }, (_, i) => ((hash >> (i % 30)) & 1));
}

export default function MyQRCodes() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        setLoading(true);
        attendeeApi.getTickets(user.email)
            .then(d => setTickets((d.tickets || []).filter(t => t.status !== 'cancelled')))
            .catch(err => {
                console.error(err);
                setTickets([]);
            })
            .finally(() => setLoading(false));
    }, [user?.email]);

    return (
        <div>
            <div className="sp-header">
                <h1 className="sp-title">My QR Codes</h1>
                <p className="sp-sub">Scan these at the event entrance</p>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading QR codes...</div>
            ) : tickets.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
                    <p style={{ margin: 0, fontSize: 15 }}>No QR codes yet.</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13 }}>QR codes are generated after ticket confirmation.</p>
                </div>
            ) : (
                <div className="sp-qr-grid">
                    {tickets.map((t, i) => {
                        const qr = buildQR(t.ticketId);
                        return (
                            <div key={i} className="sp-qr-card">
                                <div className="sp-qr-top">
                                    <div>
                                        <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>{t.eventName || t.event}</h3>
                                        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#64748b' }}>📅 {t.eventDate}</p>
                                        {t.venue && <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>📍 {t.venue}</p>}
                                    </div>
                                </div>
                                <div className="sp-qr-code">
                                    {t.qrCode ? (
                                        <img src={t.qrCode} alt="Ticket QR" style={{ width: 140, height: 140, borderRadius: 10 }} />
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, width: 140, margin: '0 auto' }}>
                                            {qr.map((c, j) => (
                                                <div key={j} style={{ width: 16, height: 16, background: c ? '#1a1d29' : 'transparent', borderRadius: 2 }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="sp-qr-meta">
                                    <span>Type: <strong>{t.ticketType}</strong></span>
                                    <span>ID: <code style={{ fontSize: 11 }}>{t.ticketId}</code></span>
                                </div>
                                <span style={{
                                    display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 12,
                                    background: t.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                                    color: t.status === 'confirmed' ? '#16a34a' : '#d97706',
                                }}>{t.status}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
