import Logo from './Logo';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <Logo size={34} />
                            <span>EventSphere</span>
                        </div>
                        <p className="footer-desc">
                            Your one-stop platform to discover,<br />
                            book, and manage events with ease.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="social-link" aria-label="Facebook">f</a>
                            <a href="#" className="social-link" aria-label="Instagram">in</a>
                            <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
                            <a href="#" className="social-link" aria-label="LinkedIn">🔗</a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Quick Links</h4>
                        <ul>
                            {['Home', 'Events', 'Vendors', 'About Us', 'Contact'].map(l => (
                                <li key={l}><a href="#">{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Categories</h4>
                        <ul>
                            {['Music', 'Business', 'Sports', 'Art', 'Food', 'Technology'].map(l => (
                                <li key={l}><a href="#">{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Support</h4>
                        <ul>
                            {['Help Center', 'Terms & Conditions', 'Privacy Policy', 'Refund Policy', 'Contact Us'].map(l => (
                                <li key={l}><a href="#">{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Contact Us</h4>
                        <ul>
                            <li><a href="#">📞 +251 911 234 567</a></li>
                            <li><a href="#">✉️ info@eventsphere.com</a></li>
                            <li><a href="#">📍 Addis Ababa, Ethiopia</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 EventSphere. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
