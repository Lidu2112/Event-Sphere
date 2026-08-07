import { useState, useEffect } from 'react';
import { api } from '../../../api/admin';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import './AdminPages.css';

const DEFAULTS = {
    platformName: 'EventSphere',
    supportEmail: 'support@eventsphere.com',
    commissionRate: 10,
    allowSelfRegistration: true,
    requireOrganizerApproval: true,
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmation: true,
    paymentNotification: true,
    newOrganizerAlert: true,
    // Security Settings
    twoFactorAuth: false,
    maintenanceMode: false,
    sessionTimeout: 30,
};

function Toggle({ checked, onChange, label, desc }) {
    return (
        <div className="toggle-row">
            <div>
                <div className="toggle-label">{label}</div>
                {desc && <div className="toggle-desc">{desc}</div>}
            </div>
            <label className="toggle-switch">
                <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
                <span className="toggle-slider" />
            </label>
        </div>
    );
}

export default function PlatformSettings() {
    const { applySettings } = useSettings();
    const { user } = useAuth();
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    // Password change state
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    useEffect(() => {
        api.getSettings()
            .then(data => setSettings({ ...DEFAULTS, ...data.settings }))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    function set(key, value) {
        setSettings(s => ({ ...s, [key]: value }));
        setMsg(null);
    }

    async function handleSave() {
        setSaving(true);
        setMsg(null);
        try {
            const data = await api.saveSettings(settings);
            applySettings(data.settings);
            setSettings({ ...DEFAULTS, ...data.settings });
            setMsg({ ok: true, text: '✅ Settings saved successfully.' });
        } catch (err) {
            setMsg({ ok: false, text: err.message || 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwMsg({ ok: false, text: 'New passwords do not match.' });
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwMsg({ ok: false, text: 'New password must be at least 6 characters.' });
            return;
        }
        setPwSaving(true);
        setPwMsg(null);
        try {
            await api.changeAdminPassword({
                adminId: user?._id || user?.id,
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            setPwMsg({ ok: true, text: '✅ Password changed successfully.' });
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwMsg({ ok: false, text: err.message || 'Failed to change password.' });
        } finally {
            setPwSaving(false);
        }
    }

    const inp = {
        width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    };

    if (loading) return (
        <div className="admin-page" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            Loading settings...
        </div>
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Platform Settings</h2>
                    <p className="page-subtitle">Configure global platform settings — saved to database</p>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save All Settings'}
                </button>
            </div>

            {msg && (
                <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600, background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626' }}>
                    {msg.text}
                </div>
            )}

            <div className="settings-grid">

                {/* ── 1. General Settings ── */}
                <div className="settings-section">
                    <h3 className="settings-title">⚙️ General Settings</h3>
                    <div className="settings-form">
                        <div className="form-field">
                            <label>Platform Name</label>
                            <input type="text" value={settings.platformName} onChange={e => set('platformName', e.target.value)} style={inp} />
                        </div>
                        <div className="form-field">
                            <label>Support Email</label>
                            <input type="email" value={settings.supportEmail} onChange={e => set('supportEmail', e.target.value)} style={inp} />
                        </div>
                        <div className="form-field">
                            <label>Commission Rate (%)</label>
                            <input type="number" min="0" max="100" value={settings.commissionRate} onChange={e => set('commissionRate', Number(e.target.value))} style={inp} />
                        </div>
                    </div>
                </div>

                {/* ── 2. Registration Settings ── */}
                <div className="settings-section">
                    <h3 className="settings-title">🔐 Registration Settings</h3>
                    <div className="settings-toggles">
                        <Toggle checked={settings.allowSelfRegistration} onChange={v => set('allowSelfRegistration', v)}
                            label="Allow Self Registration" desc="Users can register without invitation" />
                        <Toggle checked={settings.requireOrganizerApproval} onChange={v => set('requireOrganizerApproval', v)}
                            label="Require Organizer Approval" desc="Organizers must be approved before creating events" />
                    </div>
                </div>

                {/* ── 3. Notification Settings ── */}
                <div className="settings-section">
                    <h3 className="settings-title">🔔 Notification Settings</h3>
                    <div className="settings-toggles">
                        <Toggle checked={settings.emailNotifications} onChange={v => set('emailNotifications', v)}
                            label="Email Notifications" desc="Send system emails for tickets, resets, and alerts" />
                        <Toggle checked={settings.bookingConfirmation} onChange={v => set('bookingConfirmation', v)}
                            label="Booking Confirmation" desc="Email attendees when their booking is confirmed" />
                        <Toggle checked={settings.paymentNotification} onChange={v => set('paymentNotification', v)}
                            label="Payment Notification" desc="Notify users and organizers on successful payments" />
                        <Toggle checked={settings.newOrganizerAlert} onChange={v => set('newOrganizerAlert', v)}
                            label="New Organizer Request Alert" desc="Alert admin when a new organizer registration is submitted" />
                        <Toggle checked={settings.smsNotifications} onChange={v => set('smsNotifications', v)}
                            label="SMS Notifications" desc="Send SMS alerts for ticket confirmations (requires SMS provider)" />
                    </div>
                </div>

                {/* ── 4. Security Settings ── */}
                <div className="settings-section">
                    <h3 className="settings-title">🛡️ Security Settings</h3>
                    <div className="settings-toggles">
                        <Toggle checked={settings.twoFactorAuth} onChange={v => set('twoFactorAuth', v)}
                            label="Two-Factor Authentication" desc="Require 2FA for all admin logins" />
                        <Toggle checked={settings.maintenanceMode} onChange={v => set('maintenanceMode', v)}
                            label="Maintenance Mode" desc="Platform becomes unavailable to all non-admin users" />
                    </div>

                    {/* Session Timeout */}
                    <div style={{ marginTop: 16 }}>
                        <div className="toggle-row" style={{ alignItems: 'center' }}>
                            <div>
                                <div className="toggle-label">Session Timeout</div>
                                <div className="toggle-desc">Auto-logout after inactivity (minutes)</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="number"
                                    min="5"
                                    max="480"
                                    value={settings.sessionTimeout || 30}
                                    onChange={e => set('sessionTimeout', Number(e.target.value))}
                                    style={{ width: 80, padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, textAlign: 'center' }}
                                />
                                <span style={{ fontSize: 13, color: '#64748b' }}>min</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 5. Change Admin Password ── */}
                <div className="settings-section">
                    <h3 className="settings-title">🔑 Change Admin Password</h3>

                    {pwMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600, background: pwMsg.ok ? '#dcfce7' : '#fee2e2', color: pwMsg.ok ? '#16a34a' : '#dc2626' }}>
                            {pwMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-field">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                placeholder="Enter current password"
                                required
                                style={inp}
                            />
                        </div>
                        <div className="form-field">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={pwForm.newPassword}
                                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                placeholder="Minimum 6 characters"
                                required
                                style={inp}
                            />
                        </div>
                        <div className="form-field">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={pwForm.confirmPassword}
                                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                placeholder="Repeat new password"
                                required
                                style={inp}
                            />
                        </div>
                        <div>
                            <button type="submit" className="btn-primary" disabled={pwSaving} style={{ minWidth: 160 }}>
                                {pwSaving ? 'Changing...' : '🔑 Change Password'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
