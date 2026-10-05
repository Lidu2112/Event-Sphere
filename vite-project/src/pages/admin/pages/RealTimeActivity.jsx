import { useEffect, useState, useRef } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

function formatTime(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RealTimeActivity() {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const timerRef = useRef(null);

    async function loadActivity() {
        setLoading(true);
        setError('');
        try {
            const data = await api.getActivity({ limit: 25 });
            setActivity(data.activity || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Unable to load activity.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadActivity();
        timerRef.current = setInterval(loadActivity, 10000);
        return () => clearInterval(timerRef.current);
    }, []);

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Real-time Activity</h2>
                    <p className="page-subtitle">Live platform events from MySQL notifications.</p>
                </div>
                <button className="btn-primary" onClick={loadActivity}>Refresh</button>
            </div>

            <div className="section-box">
                {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}
                {loading ? (
                    <p style={{ color: '#64748b' }}>Loading activity...</p>
                ) : activity.length === 0 ? (
                    <p style={{ color: '#64748b' }}>No recent activity found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {activity.map((item, index) => (
                            <div key={item._id || item.id || index} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ minWidth: 60, fontSize: 13, fontWeight: 700, color: '#64748b' }}>{formatTime(item.createdAt)}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{item.title || 'Activity'}</div>
                                    <div style={{ marginTop: 4, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{item.message || 'No details available.'}</div>
                                    {item.userEmail && <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>User: {item.userEmail}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
