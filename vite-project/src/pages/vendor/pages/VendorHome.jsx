import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

export default function VendorHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const email = user?.email || '';

    const [stats, setStats] = useState({ activeServices: 0, newRequests: 0, completedBookings: 0, totalRevenue: 0 });
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!email) return;
        Promise.all([
            vendorApi.getStats(email),
            vendorApi.getBookings(email),
        ]).then(([s, b]) => {
            if (s.success) setStats(s.stats);
            if (b.success) setRequests(b.bookings.slice(0, 4));
        }).catch(console.error).finally(() => setLoading(false));
    }, [email]);

    const ACTIONS = [
        { icon: '🪪', label: 'My Profile', color: '#8b5cf6', path: '/vendor/profile' },
        { icon: '➕', label: 'Add Service', color: '#ec4899', path: '/vendor/services' },
        { icon: '📩', label: 'Requests', color: '#f59e0b', path: '/vendor/bookings' },
        { icon: '🖼️', label: 'Portfolio', color: '#0ea5e9', path: '/vendor/portfolio' },
        { icon: '⭐', label: 'Reviews', color: '#f59e0b', path: '/vendor/reviews' },
        { icon: '💰', label: 'Payments', color: '#10b981', path: '/vendor/payments' },
    ];

    return (
        <div>
            <PageHeader title="Vendor Dashboard" subtitle="Manage your services and track bookings" />

            <div className="stats-grid">
                <StatCard icon="🏪" label="Active Services" value={stats.activeServices} color="#ec4899" />
                <StatCard icon="📩" label="New Requests" value={stats.newRequests} color="#f59e0b" />
                <StatCard icon="✅" label="Completed Bookings" value={stats.completedBookings} color="#10b981" />
                <StatCard icon="💰" label="Total Revenue" value={`ETB ${(stats.totalRevenue || 0).toLocaleString()}`} color="#10b981" />
            </div>

            {/* Quick Actions — each navigates to the correct page */}
            <SectionBox title="Quick Actions">
                <div className="actions-grid">
                    {ACTIONS.map(a => (
                        <button
                            key={a.path}
                            onClick={() => navigate(a.path)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: 8, padding: '16px 12px', border: `1px solid ${a.color}30`,
                                borderRadius: 12, background: a.color + '12', color: a.color,
                                cursor: 'pointer', minWidth: 90, fontWeight: 700, fontSize: 12,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                        >
                            <span style={{ fontSize: 22 }}>{a.icon}</span>
                            {a.label}
                        </button>
                    ))}
                </div>
            </SectionBox>

            {/* Recent Booking Requests — live from MongoDB */}
            <SectionBox title="Recent Booking Requests" action={
                <button className="btn-sm" onClick={() => navigate('/vendor/bookings')}>View All</button>
            }>
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
                ) : requests.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No booking requests yet</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {requests.map(r => (
                            <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.eventName}</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{r.serviceName} · {r.clientName}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>ETB {r.amount?.toLocaleString()}</span>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                                        background: r.status === 'accepted' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                        color: r.status === 'accepted' ? '#16a34a' : r.status === 'rejected' ? '#dc2626' : '#d97706',
                                    }}>{r.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>
        </div>
    );
}
