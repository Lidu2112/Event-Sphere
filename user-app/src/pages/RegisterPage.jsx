import { GoogleLogin } from '@react-oauth/google';
import { apiUrl } from '../api/config';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
    const { saveSession } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('email');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const strength = getStrength(password);

    function getStrength(p) {
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    }



async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    if (!name) {
        setError("Full name is required");
        return;
    }

    if (tab === "email" && !email) {
        setError("Email is required");
        return;
    }

    if (tab === "phone" && !phone) {
        setError("Phone number is required");
        return;
    }

    if (!password) {
        setError("Password is required");
        return;
    }

    if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
    }

    if (password !== confirm) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);

    try {

        const body = {
            name,
            password,
            role: "attendee"
        };

        if (tab === "email") {
            body.email = email;
        } else {
            body.phone = phone;
        }

        const response = await fetch(
            apiUrl('/api/auth/register'),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        alert("Account created successfully");

        navigate("/login");

    } catch (error) {

        setError(error.message);

    } finally {

        setLoading(false);

    }
}


    function handleGoogle() {
        setLoading(true);
        setTimeout(() => {
            const fakeToken = btoa('google-oauth-token');
            saveSession({ name: 'Google User', email: 'user@gmail.com' }, fakeToken);
            navigate('/dashboard');
        }, 800);
    }

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', '#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];

    return (
        <div className="auth-page">
            <div className="auth-right">
                <div className="auth-card">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-sub">
                        Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                    </p>

                    {/* Google */}
                   <GoogleLogin

onSuccess={async (credentialResponse)=>{

    try {
        const decoded = jwtDecode(credentialResponse.credential);

        const response = await fetch(
            apiUrl('/api/auth/google'),
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name: decoded.name,
                    email: decoded.email,
                    googleId: decoded.sub,
                    action:"register"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Google registration failed");
        }

        const user = data.user || {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: "attendee",
            provider: "google"
        };

        saveSession(user, data.token || "");
        navigate("/dashboard");
    } catch (err) {
        setError(err.message || "Google registration failed");
    }

}}


onError={()=>{

    setError("Google registration failed");

}}

/>

                    <div className="auth-divider"><span>or register with</span></div>

                    {/* Tab switcher */}
                    <div className="auth-tabs">
                        <button className={tab === 'email' ? 'active' : ''} onClick={() => { setTab('email'); setError(''); }}>
                            <i className="fas fa-envelope"></i> Email
                        </button>
                        <button className={tab === 'phone' ? 'active' : ''} onClick={() => { setTab('phone'); setError(''); }}>
                            <i className="fas fa-phone"></i> Phone
                        </button>
                    </div>

                    {error && <div className="auth-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-field">
                            <label>Full Name</label>
                            <div className="field-wrap">
                                <i className="fas fa-user field-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Abebe Girma"
                                    value={name}
                                    onChange={e => { setName(e.target.value); setError(''); }}
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {tab === 'email' ? (
                            <div className="form-field">
                                <label>Email Address</label>
                                <div className="field-wrap">
                                    <i className="fas fa-envelope field-icon"></i>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(''); }}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="form-field">
                                <label>Phone Number</label>
                                <div className="field-wrap">
                                    <i className="fas fa-phone field-icon"></i>
                                    <input
                                        type="tel"
                                        placeholder="+251 91 000 0000"
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value); setError(''); }}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-field">
                            <label>Password</label>
                            <div className="field-wrap">
                                <i className="fas fa-lock field-icon"></i>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    autoComplete="new-password"
                                />
                                <button type="button" className="show-pass-btn" onClick={() => setShowPass(s => !s)}>
                                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {password && (
                                <div className="strength-bar">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className="strength-seg"
                                            style={{ background: i <= strength ? strengthColors[strength] : '#e5e7eb' }}
                                        />
                                    ))}
                                    <span className="strength-label" style={{ color: strengthColors[strength] }}>
                                        {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-field">
                            <label>Confirm Password</label>
                            <div className="field-wrap">
                                <i className="fas fa-lock field-icon"></i>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Repeat your password"
                                    value={confirm}
                                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                                    autoComplete="new-password"
                                />
                                {confirm && (
                                    <span className="confirm-check">
                                        <i className={`fas ${confirm === password ? 'fa-check-circle' : 'fa-times-circle'}`}
                                            style={{ color: confirm === password ? '#10b981' : '#ef4444' }}></i>
                                    </span>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? <span className="spinner"></span> : 'Create Account'}
                        </button>

                        <p className="auth-terms">
                            By registering you agree to our <a href="#" className="auth-link">Terms of Service</a> and <a href="#" className="auth-link">Privacy Policy</a>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
