import { NavLink, Outlet, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import MyTickets from './pages/MyTickets';
import MyQRCodes from './pages/MyQRCodes';
import PurchaseHistory from './pages/PurchaseHistory';
import ReviewsRatings from './pages/ReviewsRatings';
import Profile from './pages/Profile';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import './AttendeeDashboard.css';

const NAV_ITEMS = [
    { to: '/attendee/tickets', icon: ConfirmationNumberIcon, label: 'My Tickets' },
    { to: '/attendee/qrcodes', icon: QrCode2Icon, label: 'My QR Codes' },
    { to: '/attendee/history', icon: ReceiptLongIcon, label: 'Purchase History' },
    { to: '/attendee/reviews', icon: StarIcon, label: 'Reviews & Ratings' },
    { to: '/attendee/profile', icon: PersonIcon, label: 'Profile Settings' },
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
                            <span className="ad-nav-icon"><item.icon aria-hidden="true" /></span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="ad-sidebar-footer">
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                        {user?.name || user?.email || 'Attendee'}
                    </div>
                    <button className="ad-logout-btn" onClick={() => { logout(); navigate('/'); }}>
                        <LogoutIcon aria-hidden="true" style={{ fontSize: 18 }} /> Logout
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
