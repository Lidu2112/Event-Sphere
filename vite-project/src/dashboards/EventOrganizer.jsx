import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const myEvents = [
    { name: 'Addis Music Festival', date: 'Jul 15, 2026', attendees: 1240, revenue: 'ETB 124K', status: 'active' },
    { name: 'Tech Summit 2026', date: 'Aug 5, 2026', attendees: 890, revenue: 'ETB 89K', status: 'active' },
    { name: 'Cultural Expo', date: 'Sep 12, 2026', attendees: 0, revenue: 'ETB 0', status: 'draft' },
    { name: 'Startup Pitch Night', date: 'Oct 8, 2026', attendees: 320, revenue: 'ETB 16K', status: 'upcoming' },
];

function EventOrganizer() {
    return (
        <div className="dashboard">
            <Topbar
                title="Event Organizer Dashboard"
                subtitle="Create and manage your events"
                icon="🎪"
                color="#0ea5e9"
                actions={<button className="primary-btn">+ Create Event</button>}
            />

            <div className="dashboard-body">
                {/* Stats */}
                <div className="stats-grid">
                    <StatCard icon="🎪" label="Total Events" value="12" trend={3} trendLabel="this quarter" color="#0ea5e9" />
                    <StatCard icon="🎟️" label="Tickets Sold" value="3,452" trend={15} trendLabel="this month" color="#f59e0b" />
                    <StatCard icon="👥" label="Total Attendees" value="2,450" trend={12} color="#10b981" />
                    <StatCard icon="💰" label="Revenue" value="ETB 229K" trend={25} trendLabel="lifetime" color="#10b981" />
                    <StatCard icon="👷" label="Staff Members" value="8" trend={2} color="#64748b" />
                    <StatCard icon="📊" label="Avg Rating" value="4.7" trendLabel="from reviews" color="#f59e0b" />
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions-row">
                        <QuickAction icon="➕" label="Create Event" color="#0ea5e9" />
                        <QuickAction icon="🎟️" label="Sell Tickets" color="#f59e0b" />
                        <QuickAction icon="👥" label="Manage Attendees" color="#10b981" />
                        <QuickAction icon="👷" label="Invite Staff" color="#64748b" />
                        <QuickAction icon="📊" label="View Analytics" color="#6366f1" />
                        <QuickAction icon="🏪" label="Manage Vendors" color="#ec4899" />
                    </div>
                </div>

                {/* My Events */}
                <div className="section-card">
                    <div className="section-header">
                        <h3 className="section-title">My Events</h3>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Attendees</th>
                                <th>Revenue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myEvents.map((e, i) => (
                                <tr key={i}>
                                    <td className="text-bold">{e.name}</td>
                                    <td className="text-muted">{e.date}</td>
                                    <td>{e.attendees.toLocaleString()}</td>
                                    <td className="text-bold" style={{ color: '#10b981' }}>{e.revenue}</td>
                                    <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                                    <td>
                                        <button className="action-icon-btn">✏️</button>
                                        <button className="action-icon-btn">📊</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default EventOrganizer;
