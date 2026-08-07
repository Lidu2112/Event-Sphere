import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const assignedEvents = [
    { name: 'Addis Music Festival', role: 'Entry Manager', date: 'Jul 15', shift: '10:00 - 18:00', status: 'upcoming' },
    { name: 'Tech Summit 2026', role: 'Ticket Scanner', date: 'Aug 5', shift: '08:00 - 16:00', status: 'upcoming' },
    { name: 'Cultural Expo', role: 'Usher', date: 'Sep 12', shift: '12:00 - 20:00', status: 'upcoming' },
];

const recentScans = [
    { attendee: 'Yared Alemayehu', ticket: '#TK-24518', time: '14:22', status: 'valid' },
    { attendee: 'Sara Getachew', ticket: '#TK-24517', time: '14:20', status: 'valid' },
    { attendee: 'Dawit Tesfaye', ticket: '#TK-24516', time: '14:18', status: 'duplicate' },
    { attendee: 'Hana Kebede', ticket: '#TK-24515', time: '14:15', status: 'valid' },
];

function EventStaff() {
    return (
        <div className="dashboard">
            <Topbar
                title="Event Staff Dashboard"
                subtitle="Manage your assigned events and check-ins"
                icon="👷"
                color="#10b981"
                actions={<button className="primary-btn">📱 Scan QR Code</button>}
            />

            <div className="dashboard-body">
                {/* Stats */}
                <div className="stats-grid">
                    <StatCard icon="🎪" label="Assigned Events" value="3" trendLabel="upcoming" color="#10b981" />
                    <StatCard icon="✅" label="Total Check-ins" value="284" trend={45} trendLabel="today" color="#0ea5e9" />
                    <StatCard icon="👥" label="Attendees Checked" value="1,249" trendLabel="all time" color="#f59e0b" />
                    <StatCard icon="🚪" label="Active Entrances" value="4" trendLabel="monitoring" color="#6366f1" />
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions-row">
                        <QuickAction icon="📱" label="Scan Tickets" color="#10b981" />
                        <QuickAction icon="✅" label="Check-in" color="#0ea5e9" />
                        <QuickAction icon="📋" label="Attendee List" color="#6366f1" />
                        <QuickAction icon="🚪" label="Manage Entrances" color="#64748b" />
                    </div>
                </div>

                <div className="two-col">
                    {/* Assigned Events */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">My Assigned Events</h3>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Role</th>
                                    <th>Date</th>
                                    <th>Shift</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedEvents.map((e, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{e.name}</td>
                                        <td><span className="role-tag">{e.role}</span></td>
                                        <td className="text-muted">{e.date}</td>
                                        <td className="text-muted">{e.shift}</td>
                                        <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Recent Scans */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">Recent Scans</h3>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Attendee</th>
                                    <th>Ticket</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentScans.map((s, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{s.attendee}</td>
                                        <td className="text-muted">{s.ticket}</td>
                                        <td className="text-muted">{s.time}</td>
                                        <td><span className={`status-badge ${s.status}`}>{s.status}</span></td>
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

export default EventStaff;
