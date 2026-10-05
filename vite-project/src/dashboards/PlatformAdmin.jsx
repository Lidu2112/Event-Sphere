import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const recentUsers = [
    { name: 'Selam Tadesse', role: 'Event Organizer', status: 'active', joined: 'Jun 28', avatar: '🧑' },
    { name: 'Beza Haile', role: 'Vendor', status: 'pending', joined: 'Jun 27', avatar: '👩' },
    { name: 'Abel Girma', role: 'Attendee', status: 'active', joined: 'Jun 26', avatar: '🧔' },
    { name: 'Meron Alemu', role: 'Event Staff', status: 'active', joined: 'Jun 25', avatar: '👩' },
    { name: 'Yonas Bekele', role: 'Event Organizer', status: 'review', joined: 'Jun 24', avatar: '🧑' },
];

const payments = [
    { event: 'Addis Music Fest', amount: 'ETB 24,500', status: 'completed', date: 'Jun 29' },
    { event: 'Tech Summit 2026', amount: 'ETB 18,200', status: 'completed', date: 'Jun 28' },
    { event: 'Cultural Expo', amount: 'ETB 9,800', status: 'pending', date: 'Jun 27' },
    { event: 'Startup Pitch Night', amount: 'ETB 6,300', status: 'failed', date: 'Jun 26' },
];

function PlatformAdmin() {
    return (
        <div className="dashboard">
            <Topbar
                title="Platform Administrator"
                subtitle="Manage all users, events, and platform settings"
                icon="🛡️"
                color="#6366f1"
            />

            <div className="dashboard-body">
                {/* Stats */}
                <div className="stats-grid">
                    <StatCard icon="👥" label="Total Users" value="4,821" trend={12} trendLabel="vs last month" color="#6366f1" />
                    <StatCard icon="🎪" label="Active Events" value="138" trend={8} trendLabel="this month" color="#0ea5e9" />
                    <StatCard icon="🏪" label="Vendors" value="92" trend={5} trendLabel="registered" color="#ec4899" />
                    <StatCard icon="💰" label="Total Revenue" value="ETB 1.2M" trend={18} trendLabel="platform earnings" color="#10b981" />
                    <StatCard icon="🎟️" label="Tickets Sold" value="28,430" trend={22} trendLabel="all time" color="#f59e0b" />
                    <StatCard icon="⚠️" label="Pending Approvals" value="14" trend={-3} trendLabel="needs review" color="#ef4444" />
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions-row">
                        <QuickAction icon="✅" label="Approve Organizers" color="#6366f1" />
                        <QuickAction icon="👥" label="Manage Users" color="#0ea5e9" />
                        <QuickAction icon="🏪" label="Manage Vendors" color="#ec4899" />
                        <QuickAction icon="⚙️" label="Platform Settings" color="#64748b" />
                        <QuickAction icon="💳" label="Monitor Payments" color="#10b981" />
                        <QuickAction icon="📊" label="View Reports" color="#f59e0b" />
                    </div>
                </div>

                <div className="two-col">
                    {/* Recent Users */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">Recent Users</h3>
                            <button className="view-all-btn">View All</button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((u, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="cell-user">
                                                <span className="cell-avatar">{u.avatar}</span>
                                                {u.name}
                                            </div>
                                        </td>
                                        <td><span className="role-tag">{u.role}</span></td>
                                        <td className="text-muted">{u.joined}</td>
                                        <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payments */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">Payment Monitor</h3>
                            <button className="view-all-btn">View All</button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{p.event}</td>
                                        <td className="text-bold" style={{ color: '#10b981' }}>{p.amount}</td>
                                        <td className="text-muted">{p.date}</td>
                                        <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlatformAdmin;
