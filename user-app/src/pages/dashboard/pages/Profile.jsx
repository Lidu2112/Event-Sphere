import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendeeApi } from '../../../api/attendee';
import './SubPage.css';

export default function ProfileSettings() {
    const { user, saveSession, token } = useAuth();
    const userId = user?.id || user?._id;

    const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', bio: '' });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [saving, setSaving] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });
    const [pwdMsg, setPwdMsg] = useState({ text: '', ok: true });

    useEffect(() => {
        if (!userId) return;
        attendeeApi.getProfile(userId)
            .then(d => {
                if (d.user) {
                    setForm({
                        name: d.user.name || '',
                        email: d.user.email || '',
                        phone: d.user.phone || '',
                        location: d.user.location || '',
                        bio: d.user.bio || '',
                    });
                }
            })
            .catch(console.error);
    }, [userId]);

    function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setMsg({ text: '', ok: true }); }
    function changePwd(e) { setPasswords(p => ({ ...p, [e.target.name]: e.target.value })); setPwdMsg({ text: '', ok: true }); }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.name.trim()) { setMsg({ text: 'Name is required.', ok: false }); return; }
        setSaving(true);
        try {
            const d = await attendeeApi.updateProfile({ userId, ...form });
            saveSession({ ...user, name: d.user.name, email: d.user.email, phone: d.user.phone }, token);
            setMsg({ text: '✅ Profile saved successfully!', ok: true });
        } catch (err) {
            setMsg({ text: err.message, ok: false });
        } finally {
            setSaving(false);
        }
    }

    async function handlePassword(e) {
        e.preventDefault();
        if (!passwords.current) { setPwdMsg({ text: 'Enter your current password.', ok: false }); return; }
        if (passwords.newPass.length < 6) { setPwdMsg({ text: 'New password must be at least 6 characters.', ok: false }); return; }
        if (passwords.newPass !== passwords.confirm) { setPwdMsg({ text: 'Passwords do not match.', ok: false }); return; }
        setSavingPwd(true);
        try {
            await attendeeApi.changePassword({ userId, currentPassword: passwords.current, newPassword: passwords.newPass });
            setPwdMsg({ text: '✅ Password updated successfully!', ok: true });
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            setPwdMsg({ text: err.message, ok: false });
        } finally {
            setSavingPwd(false);
        }
    }

    const initials = form.name
        ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : (form.email?.[0] || '?').toUpperCase();

    return (
        <div>
            <div className="sp-header">
                <h1 className="sp-title">Profile Settings</h1>
                <p className="sp-sub">Manage your account information</p>
            </div>

            <div className="sp-profile-layout">
                {/* Avatar */}
                <div className="sp-avatar-card">
                    <div className="sp-avatar-circle">{initials}</div>
                    <div className="sp-avatar-name">{form.name || 'Your Name'}</div>
                    <div className="sp-avatar-role">Attendee</div>
                    {user?.provider === 'google' && (
                        <div className="sp-provider-badge">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="14" alt="Google" />
                            Signed in with Google
                        </div>
                    )}
                </div>

                {/* Profile form */}
                <form className="sp-form" onSubmit={handleSave}>
                    <div className="sp-form-row">
                        <div className="sp-field">
                            <label>Full Name</label>
                            <input name="name" type="text" value={form.name} onChange={change} placeholder="Your full name" />
                        </div>
                        <div className="sp-field">
                            <label>Email Address</label>
                            <input name="email" type="email" value={form.email} onChange={change} placeholder="your@email.com" />
                        </div>
                    </div>
                    <div className="sp-form-row">
                        <div className="sp-field">
                            <label>Phone Number</label>
                            <input name="phone" type="tel" value={form.phone} onChange={change} placeholder="+251 91 000 0000" />
                        </div>
                        <div className="sp-field">
                            <label>Location</label>
                            <input name="location" type="text" value={form.location} onChange={change} placeholder="Addis Ababa, Ethiopia" />
                        </div>
                    </div>
                    <div className="sp-field">
                        <label>Bio</label>
                        <textarea name="bio" rows={3} value={form.bio} onChange={change} placeholder="Tell us a bit about yourself..." />
                    </div>

                    {msg.text && (
                        <div style={{
                            padding: '9px 14px', borderRadius: 8,
                            background: msg.ok ? '#dcfce7' : '#fee2e2',
                            color: msg.ok ? '#16a34a' : '#dc2626', fontSize: 13
                        }}>
                            {msg.text}
                        </div>
                    )}

                    <div className="sp-form-actions">
                        <button type="submit" className="sp-save-btn" disabled={saving}>
                            {saving ? 'Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password change — only for local accounts */}
            {user?.provider !== 'google' && (
                <form className="sp-form" onSubmit={handlePassword} style={{ marginTop: 24, maxWidth: 680 }}>
                    <div className="sp-divider" />
                    <h3 className="sp-section-title">Change Password</h3>
                    <div className="sp-form-row">
                        <div className="sp-field">
                            <label>Current Password</label>
                            <input name="current" type="password" value={passwords.current} onChange={changePwd} placeholder="••••••••" />
                        </div>
                        <div className="sp-field">
                            <label>New Password</label>
                            <input name="newPass" type="password" value={passwords.newPass} onChange={changePwd} placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="sp-form-row">
                        <div className="sp-field">
                            <label>Confirm New Password</label>
                            <input name="confirm" type="password" value={passwords.confirm} onChange={changePwd} placeholder="••••••••" />
                        </div>
                    </div>
                    {pwdMsg.text && (
                        <div style={{
                            padding: '9px 14px', borderRadius: 8,
                            background: pwdMsg.ok ? '#dcfce7' : '#fee2e2',
                            color: pwdMsg.ok ? '#16a34a' : '#dc2626', fontSize: 13
                        }}>
                            {pwdMsg.text}
                        </div>
                    )}
                    <div className="sp-form-actions">
                        <button type="submit" className="sp-save-btn" disabled={savingPwd}>
                            {savingPwd ? 'Updating...' : '🔒 Update Password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
