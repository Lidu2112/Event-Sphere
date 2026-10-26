import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLang();
    const navigate = useNavigate();
    const location = useLocation();

    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);

    const profileRef = useRef(null);
    const langRef = useRef(null);

    const isAttendee = user?.role === 'attendee';
    const isLanding = location.pathname === '/';
    const isActive = (path) =>
        location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
        setLangOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handle = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const NAV_LINKS = [
        { to: '/', label: t(lang, 'nav_home') },
        { to: '/events', label: t(lang, 'nav_events') },
        { to: '/vendors', label: t(lang, 'nav_vendors') },
        { to: '/categories', label: t(lang, 'nav_categories') },
        { to: '/about', label: t(lang, 'nav_about') },
    ];

    const ATTENDEE_LINKS = [
        { to: '/attendee/tickets', label: t(lang, 'nav_my_tickets') },
        { to: '/attendee/qrcodes', label: t(lang, 'nav_my_qr') },
        { to: '/attendee/history', label: t(lang, 'nav_purchase_history') },
        { to: '/attendee/reviews', label: t(lang, 'nav_reviews') },
    ];

    const firstName = (user?.name || user?.email || 'User').split(' ')[0];

    const handleLogout = async () => {
        setProfileOpen(false);
        setMobileOpen(false);
        try { await logout(); navigate('/'); } catch { }
    };

    return (
        <nav className={`navbar ${isLanding ? 'navbar-transparent' : 'navbar-solid'}`}>
            <div className="nav-container">
              <Link to="/" className="nav-logo">
    <span className="logo-text">
        Ethio<span className="highlight">EventSphere</span>
    </span>
</Link>
                {/* Desktop nav */}
                <div className="nav-menu">
                    {NAV_LINKS.map(l => (
                        <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
                            {l.label}
                        </Link>
                    ))}
                    {isAttendee && (
                        <div className="nav-item nav-dropdown">
                            <button type="button" className="nav-link nav-dropdown-toggle">
                                {t(lang, 'nav_attendee')} ▾
                            </button>
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
                    {/* Language switcher */}
                    <div className="nav-lang-dropdown" ref={langRef}>
                        <button
                            type="button"
                            className="nav-lang-btn"
                            onClick={() => setLangOpen(o => !o)}
                            aria-label="Choose language"
                            aria-expanded={langOpen}
                        >
                            <Globe size={16} color="#2A1527" aria-hidden="true" />
                            <span className="lang-text">{lang === 'en' ? 'EN' : 'አማ'}</span>
                            <span className="lang-arrow">▾</span>
                        </button>
                        {langOpen && (
                            <div className="nav-lang-menu">
                                <button type="button" className={`nav-lang-item ${lang === 'en' ? 'active' : ''}`} onClick={() => { setLang('en'); setLangOpen(false); }}>EN</button>
                                <button type="button" className={`nav-lang-item ${lang === 'am' ? 'active' : ''}`} onClick={() => { setLang('am'); setLangOpen(false); }}>AM</button>
                            </div>
                        )}
                    </div>

                    {user ? (
                        <div className="nav-profile" ref={profileRef}>
                            <button type="button" className="nav-profile-btn" onClick={() => setProfileOpen(o => !o)} aria-expanded={profileOpen}>
                                {t(lang, 'nav_hi')} {firstName} ▼
                            </button>
                            {profileOpen && (
                                <div className="nav-profile-menu">
                                    <Link to="/attendee/profile" className="nav-profile-item" onClick={() => setProfileOpen(false)}>
                                        {t(lang, 'nav_my_profile')}
                                    </Link>
                                    <button type="button" className="nav-profile-item logout-item" onClick={handleLogout}>
                                        {t(lang, 'nav_logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button type="button" className="nav-btn login" onClick={() => navigate('/login')}>
                                {t(lang, 'nav_login')}
                            </button>
                            <button type="button" className="nav-btn register" onClick={() => navigate('/register')}>
                                {t(lang, 'nav_register')}
                            </button>
                        </>
                    )}
                </div>

                <button type="button" className="hamburger-menu" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="mobile-nav-panel">
                    {NAV_LINKS.map(l => (
                        <Link key={l.to} to={l.to} className={`mobile-nav-link ${isActive(l.to) ? 'active' : ''}`}>
                            {l.label}
                        </Link>
                    ))}
                    {isAttendee && (
                        <>
                            <div className="mobile-nav-divider">{t(lang, 'nav_attendee')}</div>
                            {ATTENDEE_LINKS.map(l => (
                                <Link key={l.to} to={l.to} className="mobile-nav-link">{l.label}</Link>
                            ))}
                        </>
                    )}
                    <div className="mobile-nav-divider" />
                    <div className="mobile-lang-switcher">
                        <button type="button" className={`mobile-lang-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => { setLang('en'); setMobileOpen(false); }}>EN</button>
                        <button type="button" className={`mobile-lang-opt ${lang === 'am' ? 'active' : ''}`} onClick={() => { setLang('am'); setMobileOpen(false); }}>AM</button>
                    </div>
                    <div className="mobile-nav-divider" />
                    {user ? (
                        <>
                            <Link to="/attendee/profile" className="mobile-nav-link">{t(lang, 'nav_my_profile')}</Link>
                            <button type="button" className="mobile-nav-link mobile-logout" onClick={handleLogout}>{t(lang, 'nav_logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-nav-link">{t(lang, 'nav_login')}</Link>
                            <Link to="/register" className="mobile-nav-link mobile-register">{t(lang, 'nav_register')}</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
