import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

const CATEGORIES = ['Photography', 'Catering', 'DJ & Sound', 'Decoration', 'Stage Setup', 'Transport', 'Security', 'Other'];

const EMPTY = {
    companyName: '', ownerName: '', phone: '', category: '', description: '',
    address: '', website: '', facebook: '', instagram: '', telegram: '', logo: '',
};

export default function VendorProfile() {
    const { user } = useAuth();
    const email = user?.email || '';
    const vendorId = user?.id || user?._id || '';

    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });

    useEffect(() => {
        if (!email) return;
        vendorApi.getProfile(email)
            .then(d => { if (d.profile) setForm({ ...EMPTY, ...d.profile }); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [email]);

    function change(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setMsg({ text: '', ok: true });
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.companyName) { setMsg({ text: 'Company name is required.', ok: false }); return; }
        setSaving(true);
        try {
            await vendorApi.saveProfile({ ...form, vendorEmail: email, vendorId });
            setMsg({ text: '✅ Profile saved successfully!', ok: true });
        } catch (err) {
            setMsg({ text: err.message, ok: false });
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading profile...</div>;

    return (
        <div>
            <PageHeader title="Vendor Profile" subtitle="Manage your business information visible to clients" />

            <form onSubmit={handleSave}>
                {/* Business Info */}
                <SectionBox title="Business Information">
                    <div style={grid2}>
                        <Field label="Company Name *" name="companyName" value={form.companyName} onChange={change} placeholder="Your business name" />
                        <Field label="Owner Name" name="ownerName" value={form.ownerName} onChange={change} placeholder="Your full name" />
                        <Field label="Phone" name="phone" value={form.phone} onChange={change} placeholder="+251 9xx xxx xxxx" />
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select name="category" value={form.category} onChange={change} style={inputStyle}>
                                <option value="">— Select Category —</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Field label="Address" name="address" value={form.address} onChange={change} placeholder="City, Country" />
                        <Field label="Website" name="website" value={form.website} onChange={change} placeholder="https://..." />
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description" value={form.description} onChange={change}
                            rows={4} placeholder="Describe your services, experience, and what makes you unique..."
                            style={{ ...inputStyle, resize: 'vertical', height: 100 }}
                        />
                    </div>
                </SectionBox>

                {/* Logo & Social */}
                <SectionBox title="Logo & Social Links">
                    <div style={grid2}>
                        <Field label="Logo URL" name="logo" value={form.logo} onChange={change} placeholder="https://your-logo-url.com/logo.png" />
                        <Field label="Facebook" name="facebook" value={form.facebook} onChange={change} placeholder="https://facebook.com/..." />
                        <Field label="Instagram" name="instagram" value={form.instagram} onChange={change} placeholder="https://instagram.com/..." />
                        <Field label="Telegram" name="telegram" value={form.telegram} onChange={change} placeholder="https://t.me/..." />
                    </div>
                    {form.logo && (
                        <div style={{ marginTop: 12 }}>
                            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Logo Preview</p>
                            <img src={form.logo} alt="Logo" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                        </div>
                    )}
                </SectionBox>

                {msg.text && (
                    <div style={{
                        padding: '10px 16px', borderRadius: 8, marginBottom: 12,
                        background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626', fontSize: 14
                    }}>
                        {msg.text}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
                    <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: 140 }}>
                        {saving ? 'Saving...' : '💾 Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, name, value, onChange, placeholder }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
        </div>
    );
}

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#fff', boxSizing: 'border-box', outline: 'none' };
