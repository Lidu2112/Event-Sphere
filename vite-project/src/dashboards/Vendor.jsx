import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const myServices = [
    { name: 'Photography Package', bookings: 12, revenue: 'ETB 24K', status: 'active', rating: 4.8 },
    { name: 'Catering Services', bookings: 8, revenue: 'ETB 18K', status: 'active', rating: 4.9 },
    { name: 'Stage Setup', bookings: 5, revenue: 'ETB 15K', status: 'active', rating: 4.7 },
    { name: 'Sound System Rental', bookings: 0, revenue: 'ETB 0', status: 'draft', rating: 0 },
];

const bookingRequests = [
    { event: 'Addis Music Festival', service: 'Photography', date: 'Jul 15', amount: 'ETB 3,500', status: 'pending' },
    { event: 'Tech Summit 2026', service: 'Catering', date: 'Aug 5', amount: 'ETB 8,200', status: 'pending' },
    { event: 'Cultural Expo', service: 'Stage Setup', date: 'Sep 12', amount: 'ETB 5,000', status: 'accepted' },
    { event: 'Wedding Reception', service: 'Photography', date: 'Jul 20', amount: 'ETB 2,800', status: 'rejected' },
];

function Vendor() {
    return (
        <div className="dashboard">
            <Topbar
                title="Vendor Dashboard"
                subtitle="Manage your services and bookings"
                icon="🏪"
                color="#ec4899"
                actions={<button className="primary-btn">+ Add Service</button>}
            />

            <div className="dashboard-body">
                {/* Stats */}
                <div className="stats-grid">
                    <StatCard icon="🏪" label="Active Services" value="3" trendLabel="offerings" color="#ec4899" />
                    <StatCard icon="📩" label="Booking Requests" value="7" trend={12} trendLabel="this month" color="#f59e0b" />
                    <StatCard icon="✅" label="Completed Bookings" value="25" trend={15} color="#10b981" />
                    <StatCard icon="💰" label="Total Revenue" value="ETB 57K" trend={28} trendLabel="lifetime" color="#10b981" />
                    <StatCard icon="⭐" label="Average Rating" value="4.8" trendLabel="from clients" color="#f59e0b" />
                    <StatCard icon="📅" label="Availability" value="90%" trendLabel="this month" color="#0ea5e9" />
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions-row">
                        <QuickAction icon="➕" label="Add Service" color="#ec4899" />
                        <QuickAction icon="📩" label="View Requests" color="#f59e0b" />
                        <QuickAction icon="✅" label="Accept Booking" color="#10b981" />
                        <QuickAction icon="❌" label="Reject Booking" color="#ef4444" />
                        <QuickAction icon="📅" label="Manage Availability" color="#0ea5e9" />
                        <QuickAction icon="💰" label="View Payments" color="#10b981" />
                    </div>
                </div>

                <div className="two-col">
                    {/* My Services */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">My Services</h3>
                            <button className="view-all-btn">View All</button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Bookings</th>
                                    <th>Revenue</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myServices.map((s, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{s.name}</td>
                                        <td>{s.bookings}</td>
                                        <td className="text-bold" style={{ color: '#10b981' }}>{s.revenue}</td>
                                        <td>{s.rating > 0 ? `⭐ ${s.rating}` : '-'}</td>
                                        <td><span className={`status-badge ${s.status}`}>{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Booking Requests */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">Booking Requests</h3>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookingRequests.map((b, i) => (
                                    <tr key={i}>
                                        <td className="text-bold">{b.event}</td>
                                        <td><span className="role-tag">{b.service}</span></td>
                                        <td className="text-muted">{b.date}</td>
                                        <td className="text-bold" style={{ color: '#10b981' }}>{b.amount}</td>
                                        <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
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

export default Vendor;
