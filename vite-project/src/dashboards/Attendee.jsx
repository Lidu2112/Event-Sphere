import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const upcomingEvents = [
    { name: 'Addis Music Festival', date: 'Jul 15, 2026', location: 'Meskel Square', ticket: '#TK-24518', status: 'confirmed' },
    { name: 'Tech Summit 2026', date: 'Aug 5, 2026', location: 'Skylight Hotel', ticket: '#TK-89402', status: 'confirmed' },
    { name: 'Cultural Expo', date: 'Sep 12, 2026', location: 'Unity Park', ticket: '#TK-38251', status: 'pending' },
];

const purchaseHistory = [
    { event: 'Addis Music Festival', date: 'Jun 20', amount: 'ETB 850', qty: 1, status: 'paid' },
    { event: 'Tech Summit 2026', date: 'Jun 15', amount: 'ETB 1,200', qty: 2, status: 'paid' },
    { event: 'Cultural Expo', date: 'Jun 10', amount: 'ETB 500', qty: 1, status: 'paid' },
];

function Attendee() {
    return (
        <div className="dashboard">
            <Topbar
                title="Attendee Dashboard"
                subtitle="Browse events and manage your tickets"
                icon="🎟️"
                color="#f59e0b"
                actions={<button className="primary-btn">🔍 Browse Events</button>}
            />

            <div className="dashboard-body">
                {/* Stats */}
                <div className="stats-grid">
                    <StatCard icon="🎟️" label="My Tickets" value="3" trendLabel="upcoming events" color="#f59e0b" />
                    <StatCard icon="📅" label="Events Attended" value="12" trendLabel="all time" color="#0ea5e9" />
                    <StatCard icon="💰" label="Total Spent" value="ETB 8,450" trendLabel="lifetime" color="#10b981" />
                    <StatCard icon="⭐" label="Reviews Given" value="8" trendLabel="thank you!" color="#ec4899" />
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions-row">
                        <QuickAction icon="🔍" label="Browse Events" color="#f59e0b" />
                        <QuickAction icon="🎟️" label="Purchase Tickets" color="#0ea5e9" />
                        <QuickAction icon="📱" label="Digital Tickets" color="#6366f1" />
                        <QuickAction icon="📋" label="Purchase History" color="#64748b" />
                        <QuickAction icon="⭐" label="Submit Review" color="#ec4899" />
                    </div>
                </div>

                <div className="two-col">
                    {/* Upcoming Events */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">My Upcoming Events</h3>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Ticket</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingEvents.map((e, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{e.name}</td>
                                        <td className="text-muted">{e.date}</td>
                                        <td className="text-muted">{e.location}</td>
                                        <td className="ticket-code">{e.ticket}</td>
                                        <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Purchase History */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">Purchase History</h3>
                            <button className="view-all-btn">View All</button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Qty</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseHistory.map((p, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{p.event}</td>
                                        <td className="text-muted">{p.date}</td>
                                        <td className="text-bold" style={{ color: '#10b981' }}>{p.amount}</td>
                                        <td>{p.qty}</td>
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

export default Attendee;
