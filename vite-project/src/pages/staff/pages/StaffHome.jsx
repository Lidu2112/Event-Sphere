import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, ActionButton, PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { staffApi } from '../../../api/staff';

export default function StaffHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalTickets: 0, checkedInCount: 0, pendingCount: 0, attendanceRate: 0 });
    const [recentScans, setRecentScans] = useState([]);
    const [entrances, setEntrances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            staffApi.getStats(),
            staffApi.getTickets({ checkedIn: 'true', limit: 5 }),
            staffApi.getEntrances(),
        ]).then(([s, t, e]) => {
            if (s.success) setStats(s.stats);
            if (t.success) setRecentScans(t.tickets);
            if (e.success) setEntrances(e.entrances);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const activeEntrances = entrances.filter(e => e.status === 'open').length;

    return (
        <div>
            <PageHeader title="Event Staff Dashboard" subtitle="Manage check-ins and monitor event entrances" />

            <div className="stats-grid">
                <StatCard icon="🎟️" label="Total Tickets" value={loading ? '...' : stats.totalTickets} color="#0ea5e9" />
                <StatCard icon="✅" label="Checked In" value={loading ? '...' : stats.checkedInCount} color="#10b981" />
                <StatCard icon="⏳" label="Pending" value={loading ? '...' : stats.pendingCount} color="#f59e0b" />
                <StatCard icon="🚪" label="Active Entrances" value={loading ? '...' : activeEntrances} color="#6366f1" />
            </div>

            <SectionBox title="Quick Actions">
                <div className="actions-grid">
                    <ActionButton icon="📱" label="Scan Tickets" color="#10b981" onClick={() => navigate('/staff/scan')} />
                    <ActionButton icon="✅" label="Check-in" color="#0ea5e9" onClick={() => navigate('/staff/checkin')} />
                    <ActionButton icon="📋" label="Attendees" color="#6366f1" onClick={() => navigate('/staff/attendees')} />
                    <ActionButton icon="🚪" label="Entrances" color="#64748b" onClick={() => navigate('/staff/entrances')} />
                </div>
            </SectionBox>

            <div className="two-col">
                <SectionBox title="Active Entrances">
                    {loading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
                    ) : entrances.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No entrances configured.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {entrances.slice(0, 4).map(e => (
                                <div key={e._id} style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{e.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>{e.checkedInCount || 0} checked in</div>
                                    </div>
                                    <span className={`status-badge ${e.status === 'open' ? 'active' : 'failed'}`}>{e.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionBox>

                <SectionBox title="Recent Check-ins">
                    {loading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
                    ) : recentScans.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No check-ins yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recentScans.map(s => (
                                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{s.userName}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.ticketCode || s.txRef} • {s.eventTitle}</div>
                                    </div>
                                    <span className="status-badge active">checked in</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionBox>
            </div>
        </div>
    );
}
