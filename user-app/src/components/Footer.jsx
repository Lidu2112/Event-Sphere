import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import './Footer.css';

export default function Footer() {
    const { lang } = useLang();

    const quickLinks = [
        { label: t(lang, 'footer_home'), href: '/' },
        { label: t(lang, 'footer_events'), href: '/events' },
        { label: t(lang, 'footer_vendors'), href: '/vendors' },
        { label: t(lang, 'footer_about'), href: '/about' },
        { label: t(lang, 'footer_contact_link'), href: '#' },
    ];

    const categories = ['Music', 'Business', 'Sports', 'Art', 'Food', 'Technology'];

    const support = [
        t(lang, 'footer_help'),
        t(lang, 'footer_terms'),
        t(lang, 'footer_privacy'),
        t(lang, 'footer_refund'),
        t(lang, 'footer_contact'),
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 800, fontSize: 18 }}>
                                Ethio EventSphere
                            </span>
                        </div>
                        <p className="footer-desc">{t(lang, 'footer_desc')}</p>
                        <div className="footer-socials">
                            <a href="#" className="social-link" aria-label="Facebook">f</a>
                            <a href="#" className="social-link" aria-label="LinkedIn">in</a>
                            <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
                            <a href="#" className="social-link" aria-label="Link">🔗</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">{t(lang, 'footer_quick')}</h4>
                        <ul>
                            {quickLinks.map(l => (
                                <li key={l.label}><Link to={l.href}>{l.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">{t(lang, 'footer_categories')}</h4>
                        <ul>
                            {categories.map(c => (
                                <li key={c}><a href="#">{c}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">{t(lang, 'footer_support')}</h4>
                        <ul>
                            {support.map(s => (
                                <li key={s}><a href="#">{s}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">{t(lang, 'footer_contact')}</h4>
                        <ul>
                            <li><a href="#">+251 911 234 567</a></li>
                            <li><a href="#">info@eventsphere.com</a></li>
                            <li><a href="#">Addis Ababa, Ethiopia</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>{t(lang, 'footer_copyright')}</p>
                </div>
            </div>
        </footer>
    );
}
