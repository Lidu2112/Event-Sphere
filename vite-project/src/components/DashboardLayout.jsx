import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const LOGO = 'https://static.vecteezy.com/system/resources/thumbnails/043/211/173/small/people-gathered-in-front-of-a-blue-and-orange-logo-develop-a-clean-elegant-logo-for-a-conference-management-firm-free-vector.jpg';

const SAMPLE_NOTIFS = [
    { id: 1, icon: '🎟️', text: 'Your ticket for Summer Music Festival is confirmed.', time: '2 min ago', unread: true },
    { id: 2, icon: '📅', text: 'Tech Conference 2024 schedule has been updated.', time: '1 hr ago', unread: true },
    { id: 3, icon: '📣', text: "Don't miss City Marathon 2024 this weekend!", time: '3 hrs ago', unread: true },
    { id: 4, icon: '⭐', text: 'Please review your experience at Art Exhibition.', time: '1 day ago', unread: false },
];

export default function DashboardLayout({ children, navigation, roleLabel, roleIcon }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const unread = notifs.filter(n => n.unread).length;
    const basePath = navigation[0]?.path.split('/').slice(0, 3).join('/') || '/';
    const settingsPath = basePath + '/settings';

    useEffect(() => {
        function handleOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    function markAllRead() { setNotifs(ns => ns.map(n => ({ ...n, unread: false }))); }
    function markRead(id) { setNotifs(ns => ns.map(n => n.id === id ? { ...n, unread: false } : n)); }
    function handleLogout() { logout(); navigate('/login'); }

    const currentNav = navigation.find(n =>
        n.path === basePath
            ? location.pathname === n.path || location.pathname === basePath
            : location.pathname.startsWith(n.path)
    );

    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className={`dash-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className="dash-sidebar">
                <div className="ds-brand">
                    <img src={LOGO} alt="EventSphere" className="ds-brand-logo" />
                    <div>
                        <div className="ds-brand-name">EventSphere</div>
                        <div className="ds-brand-role">{roleLabel}</div>
                    </div>
                </div>

                <nav className="ds-nav">
                    {navigation.map(item => {
                        const isActive = item.path === basePath
                            ? location.pathname === item.path || location.pathname === basePath
                            : location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path}
                                className={`ds-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}>
                                <span className="ds-nav-icon">{item.icon}</span>
                                <span className="ds-nav-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="ds-user">
                    <div className="ds-user-avatar">{roleIcon}</div>
                    <div className="ds-user-info">
                        <strong>{user?.name}</strong>
                        <small>{roleLabel}</small>
                    </div>
                    <button className="ds-logout" onClick={handleLogout} title="Sign out">⏏</button>
                </div>
            </aside>

            {/* Main */}
            <div className="dash-main">
                <header className="dash-topbar">
                    <div className="dt-left">
                        <button className="hamburger" onClick={() => setSidebarOpen(s => !s)}>☰</button>
                        <div>
                            <h1 className="dt-title">{currentNav?.label || 'Dashboard'}</h1>
                            <p className="dt-breadcrumb">EventSphere / {roleLabel} / {currentNav?.label}</p>
                        </div>
                    </div>

                    <div className="dt-right">
                        <div className="dt-search">
                            <span>🔍</span>
                            <input type="text" placeholder="Search..." />
                        </div>

                        {/* Notification Bell */}
                        <div className="topbar-dropdown-wrap" ref={notifRef}>
                            <button className="dt-notif"
                                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}>
                                🔔
                                {unread > 0 && <span className="dt-badge">{unread}</span>}
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
                                        {notifs.map(n => (
                                            <div key={n.id}
                                                className={`notif-item ${n.unread ? 'unread' : ''}`}
                                                onClick={() => markRead(n.id)}>
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

                        {/* Account / Profile */}
                        <div className="topbar-dropdown-wrap" ref={profileRef}>
                            <div className="dt-profile"
                                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}>
                                <div className="dt-avatar">{initials}</div>
                                <span className="dt-uname">{user?.name?.split(' ')[0]}</span>
                                <span style={{ fontSize: 10, color: '#9ca3af' }}>▾</span>
                            </div>

                            {profileOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-dropdown-head">
                                        <div className="pd-avatar">{initials}</div>
                                        <div>
                                            <div className="pd-name">{user?.name}</div>
                                            <div className="pd-role">{roleLabel}</div>
                                        </div>
                                    </div>
                                    <div className="profile-dropdown-menu">
                                        <Link to={settingsPath} className="pd-item"
                                            onClick={() => setProfileOpen(false)}>
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

                <main className="dash-content">{children}</main>
            </div>
        </div>
    );
}
