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
                            <a href="https://www.tiktok.com/@lidu_2127" className="social-link social-link-tiktok" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.57v13.67a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6.05.88.14V9.27a6.48 6.48 0 1 0 5.59 6.4V8.73a8.37 8.37 0 0 0 4.9 1.58V6.77c-.38 0-.76-.03-1.13-.08Z" /></svg>
                            </a>
                            <a href="https://web.facebook.com/profile.php?id=61561987809823" className="social-link social-link-facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" /></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/kelem-zhekale-759a4241a" className="social-link social-link-linkedin" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9h3.4v11.5H3.5V9Zm5.5 0h3.3v1.6h.1A3.6 3.6 0 0 1 15.7 8c3.5 0 4.2 2.3 4.2 5.2v7.3h-3.4V14c0-1.6 0-3.6-2.2-3.6s-2.5 1.7-2.5 3.5v6.6H9V9Z" /></svg>
                            </a>
                            <a href="https://www.instagram.com/kelsh2112/" className="social-link social-link-instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="instagram-dot" cx="17.5" cy="6.5" r="1" /></svg>
                            </a>
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
                            <li><a href="tel:0936918154">0936918154</a></li>
                            <li><a href="mailto:lidu8749@gmail.com">lidu8749@gmail.com</a></li>
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
