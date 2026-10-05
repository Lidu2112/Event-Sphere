import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const profileRef = useRef(null);
    const isAttendee = user?.role === 'attendee';

    // Only the landing page (/) should have the transparent absolute navbar
    const isLanding = location.pathname === '/';

    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handle(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const NAV_LINKS = [
        { to: '/', label: 'Home' },
        { to: '/events', label: 'Events' },
        { to: '/vendors', label: 'Vendors' },
        { to: '/categories', label: 'Categories' },
        { to: '/about', label: 'About Us' },
    ];

    const ATTENDEE_LINKS = [
        { to: '/attendee/tickets', label: '🎟️ My Tickets' },
        { to: '/attendee/qrcodes', label: '📱 My QR Codes' },
        { to: '/attendee/history', label: '📋 Purchase History' },
        { to: '/attendee/reviews', label: '⭐ Reviews & Ratings' },
    ];

    return (
        <>
            <nav className={`navbar ${isLanding ? 'navbar-transparent' : 'navbar-solid'}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <Logo size={36} />
                        <span className="logo-text">EventSphere</span>
                    </Link>

                    {/* Desktop menu */}
                    <div className="nav-menu">
                        {NAV_LINKS.map(l => (
                            <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>{l.label}</Link>
                        ))}
                        {isAttendee && (
                            <div className="nav-item nav-dropdown">
                                <button type="button" className="nav-link nav-dropdown-toggle">Attendee ▾</button>
                                <div className="nav-dropdown-menu">
                                    {ATTENDEE_LINKS.map(l => (
                                        <Link key={l.to} to={l.to} className="nav-dropdown-item">{l.label}</Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop actions */}
                    <div className="nav-actions">
                        {user ? (
                            <div className="nav-profile" ref={profileRef}>
                                <button className="nav-profile-btn" onClick={() => setProfileOpen(o => !o)}>
                                    Hi, {(user.name || user.email || 'User').split(' ')[0]} ▼
                                </button>
                                {profileOpen && (
                                    <div className="nav-profile-menu">
                                        <Link to="/attendee/profile" className="nav-profile-item" onClick={() => setProfileOpen(false)}>
                                            👤 My Profile
                                        </Link>
                                        <button className="nav-profile-item logout-item" onClick={() => { logout(); setProfileOpen(false); }}>
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button className="nav-btn login" onClick={() => navigate('/login')}>Login</button>
                                <button className="nav-btn register" onClick={() => navigate('/register')}>Register</button>
                            </>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button
                        className="hamburger-menu"
                        onClick={() => setMobileOpen(o => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile slide-down menu */}
                {mobileOpen && (
                    <div className="mobile-nav-panel">
                        {NAV_LINKS.map(l => (
                            <Link key={l.to} to={l.to} className={`mobile-nav-link ${isActive(l.to) ? 'active' : ''}`}>
                                {l.label}
                            </Link>
                        ))}
                        {isAttendee && (
                            <>
                                <div className="mobile-nav-divider">Attendee</div>
                                {ATTENDEE_LINKS.map(l => (
                                    <Link key={l.to} to={l.to} className="mobile-nav-link">{l.label}</Link>
                                ))}
                            </>
                        )}
                        <div className="mobile-nav-divider" />
                        {user ? (
                            <>
                                <Link to="/attendee/profile" className="mobile-nav-link">👤 My Profile</Link>
                                <button className="mobile-nav-link mobile-logout" onClick={logout}>🚪 Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="mobile-nav-link">Login</Link>
                                <Link to="/register" className="mobile-nav-link mobile-register">Register</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </>
    );
}
