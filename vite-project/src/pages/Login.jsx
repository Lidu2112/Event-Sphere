import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import './Login.css';

const ROLE_ROUTES = {
    'platform-admin': '/admin',
    'event-organizer': '/organizer',
    'event-staff': '/staff',
    'vendor': '/vendor',
};

const ROLE_LABELS = {
    'platform-admin': 'Platform Administrator',
    'event-organizer': 'Event Organizer',
    'event-staff': 'Event Staff',
    'vendor': 'Vendor',
};

const ROLE_COLORS = {
    'platform-admin': '#6366f1',
    'event-organizer': '#0ea5e9',
    'event-staff': '#10b981',
    'vendor': '#ec4899',
};

export default function Login() {
    const { loginWithEmail, loginWithPhone, loginWithGoogle, error, clearError } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('email');       // email | phone | google | reset
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    function getError() { return localError || error; }

    function handleTabChange(t) {
        setTab(t);
        clearError();
        setLocalError('');
        setResetSent(false);
    }

    function redirect(role) {
        navigate(ROLE_ROUTES[role] || '/admin');
    }

    async function handleEmailLogin(e) {
        e.preventDefault();
        if (!email || !password) { setLocalError('Please fill in all fields.'); return; }
        setLoading(true);
        setTimeout(() => {
            const res = loginWithEmail(email, password);
            if (res.ok) redirect(res.role);
            setLoading(false);
        }, 600);
    }

    async function handlePhoneLogin(e) {
        e.preventDefault();
        if (!phone || !password) { setLocalError('Please fill in all fields.'); return; }
        setLoading(true);
        setTimeout(() => {
            const res = loginWithPhone(phone, password);
            if (res.ok) redirect(res.role);
            setLoading(false);
        }, 600);
    }

    async function handleGoogleLogin(account) {
        setLoading(true);
        const res = await loginWithGoogle({
            name: account.name,
            email: account.email,
            googleId: account.email,
        });
        if (res.ok) redirect(res.role);
        setLoading(false);
    }

    function handleReset(e) {
        e.preventDefault();
        if (!resetEmail) { setLocalError('Enter your email address.'); return; }
        setLoading(true);
        setTimeout(() => {
            setResetSent(true);
            setLoading(false);
        }, 800);
    }

    return (
        <div className="login-page">

            {/* Right Panel — Form */}
            <div className="login-right">
                <div className="login-card">
                    <h2 className="login-title">Welcome back</h2>
                    <p className="login-sub">Sign in to your EventSphere account</p>

                    {/* Tabs */}
                    <div className="login-tabs">
                        <button className={tab === 'email' ? 'active' : ''} onClick={() => handleTabChange('email')}>Email</button>
                        <button className={tab === 'phone' ? 'active' : ''} onClick={() => handleTabChange('phone')}>Phone</button>
                        <button className={tab === 'google' ? 'active' : ''} onClick={() => handleTabChange('google')}>Google</button>
                        <button className={tab === 'reset' ? 'active' : ''} onClick={() => handleTabChange('reset')}>Reset</button>
                    </div>

                    {/* Error */}
                    {getError() && (
                        <div className="login-error">
                            ⚠️ {getError()}
                        </div>
                    )}

                    {/* Email Login */}
                    {tab === 'email' && (
                        <form className="login-form" onSubmit={handleEmailLogin}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-wrap">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setLocalError(''); }}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrap">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setLocalError(''); }}
                                        autoComplete="current-password"
                                    />
                                    <button type="button" className="show-pass" onClick={() => setShowPass(s => !s)}>
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            <div className="form-footer">
                                <button type="button" className="forgot-link" onClick={() => handleTabChange('reset')}>
                                    Forgot password?
                                </button>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? <span className="spinner" /> : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {/* Phone Login */}
                    {tab === 'phone' && (
                        <form className="login-form" onSubmit={handlePhoneLogin}>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <div className="input-wrap">
                                    <span className="input-icon">📱</span>
                                    <input
                                        type="tel"
                                        placeholder="+251 91 100 0001"
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value); setLocalError(''); }}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrap">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setLocalError(''); }}
                                        autoComplete="current-password"
                                    />
                                    <button type="button" className="show-pass" onClick={() => setShowPass(s => !s)}>
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? <span className="spinner" /> : 'Sign In with Phone'}
                            </button>
                        </form>
                    )}

                    {/* Google Login */}
                    {tab === 'google' && (
                        <div className="google-section">
                            <p className="google-info">Select your account to continue with Google</p>
                            <div className="google-accounts">
                                {DEMO_ACCOUNTS.map(a => (
                                    <button
                                        key={a.role}
                                        className="google-account-btn"
                                        onClick={() => handleGoogleLogin(a)}
                                        disabled={loading}
                                    >
                                        <span className="g-avatar" style={{ background: ROLE_COLORS[a.role] + '20', color: ROLE_COLORS[a.role] }}>
                                            {a.avatar}
                                        </span>
                                        <div className="g-info">
                                            <strong>{a.name}</strong>
                                            <small>{a.email}</small>
                                        </div>
                                        <span className="g-arrow">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Password Reset */}
                    {tab === 'reset' && (
                        <div className="login-form">
                            {resetSent ? (
                                <div className="reset-success">
                                    <div className="reset-success-icon">📬</div>
                                    <h3>Check your email</h3>
                                    <p>We sent a password reset link to <strong>{resetEmail}</strong>.</p>
                                    <button className="submit-btn" style={{ marginTop: 20 }} onClick={() => handleTabChange('email')}>
                                        Back to Login
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleReset}>
                                    <p className="reset-info">Enter your email and we'll send you a reset link.</p>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <div className="input-wrap">
                                            <span className="input-icon">✉️</span>
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={resetEmail}
                                                onChange={e => { setResetEmail(e.target.value); setLocalError(''); }}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? <span className="spinner" /> : 'Send Reset Link'}
                                    </button>
                                    <button type="button" className="back-link" onClick={() => handleTabChange('email')}>
                                        ← Back to login
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
