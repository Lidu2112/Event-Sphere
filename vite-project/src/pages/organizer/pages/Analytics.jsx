import { useEffect, useState } from 'react';
import { StatCard, PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

export default function Analytics() {
    const { user } = useAuth();
    const [data, setData] = useState({ totalRevenue: 0, totalTicketsSold: 0, totalAttendance: 0, popularEvents: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        organizerApi.getAnalytics(user.email)
            .then(d => { if (d.success) setData(d); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    function exportCSV() {
        const rows = data.popularEvents.map(e => `${e.title},${e.sold},ETB ${e.revenue}`).join('\n');
        const blob = new Blob([`Title,Tickets Sold,Revenue\n${rows}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'analytics.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            <PageHeader title="View Analytics" subtitle="Track event performance — from MongoDB" />
            <div className="stats-grid">
                <StatCard icon="🎟️" label="Tickets Sold" value={loading ? '...' : data.totalTicketsSold} color="#f59e0b" />
                <StatCard icon="💰" label="Total Revenue" value={loading ? '...' : `ETB ${(data.totalRevenue || 0).toLocaleString()}`} color="#10b981" />
                <StatCard icon="👥" label="Attendance" value={loading ? '...' : data.totalAttendance} color="#0ea5e9" />
            </div>

            <SectionBox title="Event Performance">
                {loading ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading analytics...</div>
                ) : data.popularEvents.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No ticket data yet. Create and publish events first.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>{['Event', 'Tickets Sold', 'Revenue'].map(h => (
                                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {data.popularEvents.map(ev => (
                                <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600 }}>{ev.title}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px' }}>{ev.sold}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600, color: '#10b981' }}>ETB {(ev.revenue || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </SectionBox>

            <SectionBox title="Export Report">
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={exportCSV}>📊 Export CSV</button>
                </div>
            </SectionBox>
        </div>
    );
}
