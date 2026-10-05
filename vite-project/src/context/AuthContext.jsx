import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_BASE = 'http://localhost:5000/api/auth';

// Role name mapping: backend role → vite-project route role
const ROLE_MAP = {
    'admin': 'platform-admin',
    'platform-admin': 'platform-admin',
    'event-organizer': 'event-organizer',
    'event-staff': 'event-staff',
    'staff': 'event-staff',
    'vendor': 'vendor',
    'attendee': 'attendee',
};

// Demo fallback accounts (shown in login hints, used if backend is unreachable)
export const DEMO_ACCOUNTS = [
    { email: 'admin@eventsphere.com', phone: '+251911000001', password: 'Admin@123', role: 'platform-admin', name: 'Abebe Girma', avatar: '🛡️' },
    { email: 'organizer@eventsphere.com', phone: '+251911000002', password: 'Org@123', role: 'event-organizer', name: 'Selam Tadesse', avatar: '🎪' },
    { email: 'staff@eventsphere.com', phone: '+251911000003', password: 'Staff@123', role: 'event-staff', name: 'Dawit Bekele', avatar: '👷' },
    { email: 'vendor@eventsphere.com', phone: '+251911000005', password: 'Vendor@123', role: 'vendor', name: 'Beza Haile', avatar: '🏪' },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('vs_user');
            if (saved) {
                const parsed = JSON.parse(saved);
                const normalized = {
                    ...parsed,
                    id: parsed.id || parsed._id,
                    _id: parsed._id || parsed.id,
                };
                setUser(normalized);
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    function saveUser(u) {
        const normalized = {
            ...u,
            id: u.id || u._id,
            _id: u._id || u.id,
        };
        setUser(normalized);
        localStorage.setItem('vs_user', JSON.stringify(normalized));
    }

    function updateUserProfile(updates) {
        setUser(prev => {
            const next = prev ? { ...prev, ...updates } : prev;
            if (next) localStorage.setItem('vs_user', JSON.stringify(next));
            return next;
        });
    }

    async function loginWithEmail(email, password) {
        setError('');
        try {
            const res = await fetch(`${AUTH_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Login failed'); return { ok: false }; }

            const mappedRole = ROLE_MAP[data.user?.role] || data.user?.role;
            const u = { ...data.user, _id: data.user?.id, role: mappedRole, token: data.token };
            saveUser(u);
            return { ok: true, role: mappedRole };
        } catch {
            // Backend unreachable — try demo accounts
            const match = DEMO_ACCOUNTS.find(a => a.email === email.trim().toLowerCase() && a.password === password);
            if (match) { saveUser(match); return { ok: true, role: match.role }; }
            setError('Unable to connect to server. Check backend is running.');
            return { ok: false };
        }
    }

    async function loginWithPhone(phone, password) {
        setError('');
        try {
            const res = await fetch(`${AUTH_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Login failed'); return { ok: false }; }

            const mappedRole = ROLE_MAP[data.user?.role] || data.user?.role;
            const u = { ...data.user, _id: data.user?.id, role: mappedRole, token: data.token };
            saveUser(u);
            return { ok: true, role: mappedRole };
        } catch {
            const match = DEMO_ACCOUNTS.find(a => a.phone === phone.trim() && a.password === password);
            if (match) { saveUser(match); return { ok: true, role: match.role }; }
            setError('Unable to connect to server.');
            return { ok: false };
        }
    }

    async function loginWithGoogle(payload) {
        setError('');
        try {
            const email = typeof payload === 'string' ? payload : payload?.email;
            const res = await fetch(`${AUTH_BASE}/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: payload?.name || email,
                    email,
                    googleId: payload?.googleId || email,
                    action: 'login',
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Google login failed'); return { ok: false }; }

            const mappedRole = ROLE_MAP[data.user?.role] || data.user?.role || 'attendee';
            const u = { ...data.user, _id: data.user?.id, role: mappedRole, token: data.token, provider: 'google' };
            saveUser(u);
            return { ok: true, role: mappedRole };
        } catch {
            setError('Unable to connect to server.');
            return { ok: false };
        }
    }

    function logout() {
        setUser(null);
        setError('');
        localStorage.removeItem('vs_user');
    }

    function clearError() { setError(''); }

    return (
        <AuthContext.Provider value={{ user, error, loading, loginWithEmail, loginWithPhone, loginWithGoogle, logout, clearError, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
