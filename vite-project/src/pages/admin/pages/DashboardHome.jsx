import { useState, useEffect } from 'react';
import { api } from '../../../api/admin';
import { useSettings } from '../../../context/SettingsContext';
import './AdminPages.css';

const STAT_DEFS = [
    { icon: '👥', label: 'Total Users', color: '#6366f1', key: 'totalUsers' },
    { icon: '✅', label: 'Active Users', color: '#0ea5e9', key: 'activeUsers' },
    { icon: '🏪', label: 'Vendors', color: '#ec4899', key: 'vendors' },
    { icon: '⏳', label: 'Pending Organizers', color: '#f59e0b', key: 'pendingOrganizers' },
    { icon: '🎧', label: 'Open Support', color: '#ef4444', key: 'openSupport' },
];

export default function DashboardHome() {
    const { settings } = useSettings();
    const [statsData, setStatsData] = useState(null);
    const [quickStats, setQuickStats] = useState([
        { label: 'Platform Admins', value: '—', icon: '🛡️' },
        { label: 'Event Organizers', value: '—', icon: '🎪' },
        { label: 'Event Staff', value: '—', icon: '👷' },
        { label: 'Attendees', value: '—', icon: '🎟️' },
        { label: 'Vendors', value: '—', icon: '🏪' },
    ]);
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        Promise.all([
            api.getStats(),
            api.getUsers({ role: 'admin' }),
            api.getUsers({ role: 'event-organizer' }),
            api.getUsers({ role: 'event-staff' }),
            api.getUsers({ role: 'attendee' }),
            api.getUsers({ role: 'vendor' }),
            api.getActivity({ limit: 6 }),
        ]).then(([statsRes, admins, organizers, staff, attendees, vendors, activityRes]) => {
            setStatsData(statsRes.stats);
            setQuickStats([
                { label: 'Platform Admins', value: String(admins.users?.length || 0), icon: '🛡️' },
                { label: 'Event Organizers', value: String(organizers.users?.length || 0), icon: '🎪' },
                { label: 'Event Staff', value: String(staff.users?.length || 0), icon: '👷' },
                { label: 'Attendees', value: String(attendees.users?.length || 0), icon: '🎟️' },
                { label: 'Vendors', value: String(vendors.users?.length || 0), icon: '🏪' },
            ]);
            const normalized = (activityRes.activity || []).map(item => ({
                user: item.userName || item.user || 'System',
                action: item.message || item.action || 'Activity recorded',
                time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'recently',
                avatar: item.type === 'support' ? '🎧' : item.type === 'vendor' ? '🏪' : '🧑',
            }));
            setActivity(normalized.length ? normalized : []);
        }).catch(() => { });
    }, []);

    // Build stat cards — use live data when available, else show em dashes
    const stats = STAT_DEFS.map(s => ({
        ...s,
        value: statsData ? String(statsData[s.key] ?? '0') : '—',
    }));

    return (
        <div className="admin-page">
            {/* Platform name from settings */}
            {settings.platformName !== 'EventSphere' && (
                <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, marginBottom: 12 }}>
                    Platform: {settings.platformName}
                </p>
            )}

            {/* Stats Grid — original UI */}
            <div className="stats-grid">
                {stats.map((s, i) => (
                    <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
                        <div className="sc-top">
                            <div className="sc-icon" style={{ background: s.color + '20', color: s.color }}>
                                {s.icon}
                            </div>
                            {s.change && (
                                <div className={`sc-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
                            )}
                        </div>
                        <div className="sc-value">{s.value}</div>
                        <div className="sc-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="two-col">
                {/* Recent Activity — static (no activity API yet) */}
                <div className="section-box">
                    <div className="box-header">
                        <h3>Recent Activity</h3>
                        <button className="view-all">View All</button>
                    </div>
                    <div className="activity-list">
                        {activity.length === 0 ? (
                            <div style={{ color: '#94a3b8', padding: '12px 0' }}>No recent activity yet.</div>
                        ) : activity.map((a, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-avatar">{a.avatar}</div>
                                <div className="activity-content">
                                    <div className="activity-user">{a.user}</div>
                                    <div className="activity-action">{a.action}</div>
                                </div>
                                <div className="activity-time">{a.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Distribution — live from API */}
                <div className="section-box">
                    <div className="box-header">
                        <h3>User Distribution</h3>
                    </div>
                    <div className="quick-stat-list">
                        {quickStats.map((q, i) => (
                            <div key={i} className="quick-stat-item">
                                <span className="qs-icon">{q.icon}</span>
                                <span className="qs-label">{q.label}</span>
                                <span className="qs-value">{q.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
