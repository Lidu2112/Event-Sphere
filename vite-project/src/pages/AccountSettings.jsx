import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
    'platform-admin': 'Platform Administrator',
    'event-organizer': 'Event Organizer',
    'event-staff': 'Event Staff',
    'vendor': 'Vendor',
};

export default function AccountSettings() {
    const { user, updateUserProfile } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailNotifications: user?.emailNotifications ?? true,
        smsNotifications: user?.smsNotifications ?? false,
    });
    const [message, setMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    const roleLabel = useMemo(() => ROLE_LABELS[user?.role] || user?.role || 'Account', [user?.role]);

    function handleFieldChange(key, value) {
        setForm(prev => ({ ...prev, [key]: value }));
        if (message) setMessage(null);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!user) return;

        if (form.newPassword || form.confirmPassword || form.currentPassword) {
            if (!form.currentPassword) {
                setMessage({ type: 'error', text: 'Enter your current password to change it.' });
                return;
            }
            if (form.newPassword.length < 6) {
                setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
                return;
            }
            if (form.newPassword !== form.confirmPassword) {
                setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
                return;
            }
            if (form.currentPassword !== user.password) {
                setMessage({ type: 'error', text: 'Current password is incorrect.' });
                return;
            }
        }

        setSaving(true);
        setMessage(null);

        setTimeout(() => {
            updateUserProfile({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.newPassword || user.password,
                emailNotifications: form.emailNotifications,
                smsNotifications: form.smsNotifications,
            });
            setMessage({ type: 'success', text: 'Your account settings have been updated.' });
            setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            setSaving(false);
        }, 500);
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Account Settings</h2>
                    <p className="page-subtitle">Manage your profile, security, and notification preferences for {roleLabel}.</p>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 18,
                    fontSize: 13,
                    fontWeight: 600,
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#16a34a' : '#dc2626',
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
                <div className="settings-section" style={{ background: '#fff', borderRadius: 16, padding: 20 }}>
                    <h3 className="settings-title">Profile Details</h3>
                    <div className="settings-form">
                        <div className="form-field">
                            <label>Full Name</label>
                            <input value={form.name} onChange={e => handleFieldChange('name', e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Email Address</label>
                            <input type="email" value={form.email} onChange={e => handleFieldChange('email', e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Phone Number</label>
                            <input value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="settings-section" style={{ background: '#fff', borderRadius: 16, padding: 20 }}>
                    <h3 className="settings-title">Security</h3>
                    <div className="settings-form">
                        <div className="form-field">
                            <label>Current Password</label>
                            <input type="password" value={form.currentPassword} onChange={e => handleFieldChange('currentPassword', e.target.value)} placeholder="Enter current password to change it" />
                        </div>
                        <div className="form-field">
                            <label>New Password</label>
                            <input type="password" value={form.newPassword} onChange={e => handleFieldChange('newPassword', e.target.value)} placeholder="New password" />
                        </div>
                        <div className="form-field">
                            <label>Confirm New Password</label>
                            <input type="password" value={form.confirmPassword} onChange={e => handleFieldChange('confirmPassword', e.target.value)} placeholder="Confirm password" />
                        </div>
                    </div>
                </div>

                <div className="settings-section" style={{ background: '#fff', borderRadius: 16, padding: 20 }}>
                    <h3 className="settings-title">Notifications</h3>
                    <div className="settings-toggles">
                        <div className="toggle-row">
                            <div>
                                <div className="toggle-label">Email Updates</div>
                                <div className="toggle-desc">Receive email updates about your account and events</div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={form.emailNotifications} onChange={e => handleFieldChange('emailNotifications', e.target.checked)} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="toggle-row">
                            <div>
                                <div className="toggle-label">SMS Alerts</div>
                                <div className="toggle-desc">Receive SMS alerts for deadlines and reminders</div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={form.smsNotifications} onChange={e => handleFieldChange('smsNotifications', e.target.checked)} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
