import { NavLink, Outlet, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import MyTickets from './pages/MyTickets';
import MyQRCodes from './pages/MyQRCodes';
import PurchaseHistory from './pages/PurchaseHistory';
import ReviewsRatings from './pages/ReviewsRatings';
import Profile from './pages/Profile';
import './AttendeeDashboard.css';

const NAV_ITEMS = [
    { to: '/attendee/tickets', icon: '🎟️', label: 'My Tickets' },
    { to: '/attendee/qrcodes', icon: '📱', label: 'My QR Codes' },
    { to: '/attendee/history', icon: '📋', label: 'Purchase History' },
    { to: '/attendee/reviews', icon: '⭐', label: 'Reviews & Ratings' },
    { to: '/attendee/profile', icon: '👤', label: 'Profile Settings' },
];

export default function AttendeeDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="ad-layout">
            {/* Sidebar */}
            <aside className="ad-sidebar">
                <NavLink to="/" className="ad-sidebar-brand">
                    <Logo size={28} />
                    <span>EventSphere</span>
                </NavLink>

                <div className="ad-nav-section">
                    <div className="ad-nav-label">My Account</div>
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `ad-nav-link${isActive ? ' active' : ''}`}
                        >
                            <span className="ad-nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="ad-sidebar-footer">
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                        {user?.name || user?.email || 'Attendee'}
                    </div>
                    <button className="ad-logout-btn" onClick={() => { logout(); navigate('/'); }}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ad-main">
                <Routes>
                    <Route index element={<Navigate to="/attendee/tickets" replace />} />
                </Routes>
            </main>
        </div>
    );
}
