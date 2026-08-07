import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/admin';
import './AdminLayout.css';

const LOGO = 'https://static.vecteezy.com/system/resources/thumbnails/043/211/173/small/people-gathered-in-front-of-a-blue-and-orange-logo-develop-a-clean-elegant-logo-for-a-conference-management-firm-free-vector.jpg';

const NAV = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Manage Users', icon: '👥' },
    { path: '/admin/organizers', label: 'Approve Organizers', icon: '✅' },
    { path: '/admin/vendors', label: 'Manage Vendors', icon: '🏪' },
    { path: '/admin/events', label: 'Event Management', icon: '📅' },
    { path: '/admin/tickets', label: 'Ticket Management', icon: '🎫' },
    { path: '/admin/entrances', label: 'Entrances Monitor', icon: '🚪' },
    { path: '/admin/activity', label: 'Real-time Activity', icon: '⚡' },
    { path: '/admin/settings', label: 'Platform Settings', icon: '⚙️' },
    { path: '/admin/payments', label: 'Monitor Payments', icon: '💳' },
    { path: '/admin/reports', label: 'View Reports', icon: '📈' },
    { path: '/admin/support', label: 'Support Requests', icon: '🎧' },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const unread = notifications.filter(n => n.unread).length;

    useEffect(() => {
        api.getActivity({ limit: 8 }).then(res => {
            const items = (res.activity || []).map((item, index) => ({
                id: item._id || item.id || index + 1,
                icon: item.type === 'support' ? '🎧' : item.type === 'vendor' ? '🏪' : '👤',
                text: item.message || item.action || 'Recent admin activity',
                time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'recently',
                unread: index < 3,
            }));
            setNotifications(items.length ? items : []);
        }).catch(() => setNotifications([]));
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function markAllRead() {
        setNotifications(ns => ns.map(n => ({ ...n, unread: false })));
    }

    function markRead(id) {
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, unread: false } : n));
    }

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const currentNav = NAV.find(n =>
        n.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(n.path)
    );

    const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className={`admin-layout ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
            {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="as-brand">
                    <img src={LOGO} alt="EventSphere" className="as-brand-logo" />
                    <div>
                        <div className="as-brand-name">EventSphere</div>
                        <div className="as-brand-role">Admin Portal</div>
                    </div>
                </div>

                <nav className="as-nav">
                    {NAV.map(item => {
                        const isActive = item.path === '/admin'
                            ? location.pathname === '/admin'
                            : location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path}
                                className={`as-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}>
                                <span className="as-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="as-user">
                    <div className="as-user-avatar">🛡️</div>
                    <div className="as-user-info">
                        <strong>{user?.name}</strong>
                        <small>Platform Admin</small>
                    </div>
                    <button className="as-logout" onClick={handleLogout} title="Sign out">⏏</button>
                </div>
            </aside>

            {/* Main */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="at-left">
                        <button className="hamburger" onClick={() => setSidebarOpen(s => !s)}>☰</button>
                        <div>
                            <h1 className="at-title">{currentNav?.label || 'Dashboard'}</h1>
                            <p className="at-breadcrumb">EventSphere / Admin / {currentNav?.label}</p>
                        </div>
                    </div>

                    <div className="at-right">
                        <div className="at-search">
                            <span>🔍</span>
                            <input type="text" placeholder="Search..." />
                        </div>

                        {/* Notification Bell */}
                        <div className="topbar-dropdown-wrap" ref={notifRef}>
                            <button className="at-notif" onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}>
                                🔔
                                {unread > 0 && <span className="at-badge">{unread}</span>}
                            </button>

                            {notifOpen && (
                                <div className="notif-dropdown">
                                    <div className="notif-dropdown-head">
                                        <span>Notifications</span>
                                        {unread > 0 && (
                                            <button className="notif-mark-all" onClick={markAllRead}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="notif-list">
                                        {notifications.map(n => (
                                            <div
                                                key={n.id}
                                                className={`notif-item ${n.unread ? 'unread' : ''}`}
                                                onClick={() => markRead(n.id)}
                                            >
                                                <div className="notif-item-icon">{n.icon}</div>
                                                <div className="notif-item-body">
                                                    <p>{n.text}</p>
                                                    <span>{n.time}</span>
                                                </div>
                                                {n.unread && <div className="notif-dot" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile / Account */}
                        <div className="topbar-dropdown-wrap" ref={profileRef}>
                            <div className="at-profile" onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}>
                                <div className="at-avatar">{initials}</div>
                                <span className="at-name">{user?.name}</span>
                                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>▾</span>
                            </div>

                            {profileOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-dropdown-head">
                                        <div className="pd-avatar">{initials}</div>
                                        <div>
                                            <div className="pd-name">{user?.name}</div>
                                            <div className="pd-role">Platform Admin</div>
                                        </div>
                                    </div>
                                    <div className="profile-dropdown-menu">
                                        <Link to="/admin/settings" className="pd-item" onClick={() => setProfileOpen(false)}>
                                            <span>⚙️</span> Account Settings
                                        </Link>
                                        <button className="pd-item pd-logout" onClick={handleLogout}>
                                            <span>🚪</span> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="admin-content">{children}</main>
            </div>
        </div>
    );
}
