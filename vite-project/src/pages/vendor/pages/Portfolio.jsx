import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

export default function Portfolio() {
    const { user } = useAuth();
    const email = user?.email || '';
    const vendorId = user?.id || user?._id || '';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ url: '', caption: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!email) return;
        load();
    }, [email]);

    async function load() {
        setLoading(true);
        try {
            const d = await vendorApi.getPortfolio(email);
            setItems(d.portfolio || []);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }

    async function handleAdd() {
        if (!form.url.trim()) { setMsg('Image URL is required.'); return; }
        setSaving(true);
        setMsg('');
        try {
            const d = await vendorApi.addPortfolioItem({ vendorEmail: email, vendorId, url: form.url, caption: form.caption });
            setItems(d.portfolio || []);
            setForm({ url: '', caption: '' });
            setAdding(false);
        } catch (e) { setMsg(e.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(itemId) {
        if (!window.confirm('Remove this image from your portfolio?')) return;
        try {
            const d = await vendorApi.deletePortfolioItem(itemId, email);
            setItems(d.portfolio || []);
        } catch (e) { alert(e.message); }
    }

    return (
        <div>
            <PageHeader
                title="Portfolio / Gallery"
                subtitle="Showcase your work with photos from past events"
                action={
                    <button className="btn-primary" onClick={() => { setAdding(true); setMsg(''); }}>
                        + Add Image
                    </button>
                }
            />

            {/* Add Image Modal */}
            {adding && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>Add Portfolio Image</h3>
                        <label style={labelStyle}>Image URL *</label>
                        <input
                            value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                            placeholder="https://example.com/photo.jpg"
                            style={{ ...inputStyle, marginBottom: 12 }}
                        />
                        {form.url && (
                            <img src={form.url} alt="preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                                onError={e => { e.target.style.display = 'none'; }} />
                        )}
                        <label style={labelStyle}>Caption (optional)</label>
                        <input
                            value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                            placeholder="e.g. Wedding at Sheraton Hotel"
                            style={{ ...inputStyle, marginBottom: 16 }}
                        />
                        {msg && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{msg}</div>}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => { setAdding(false); setMsg(''); }} style={btnSecondary}>Cancel</button>
                            <button onClick={handleAdd} className="btn-primary" disabled={saving}>
                                {saving ? 'Adding...' : 'Add to Portfolio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox Preview */}
            {preview && (
                <div style={{ ...modalOverlay, zIndex: 1100 }} onClick={() => setPreview(null)}>
                    <div style={{ maxWidth: 700, width: '90%' }} onClick={e => e.stopPropagation()}>
                        <img src={preview.url} alt={preview.caption} style={{ width: '100%', borderRadius: 12, maxHeight: '80vh', objectFit: 'contain' }} />
                        {preview.caption && <p style={{ textAlign: 'center', color: '#fff', marginTop: 10, fontSize: 14 }}>{preview.caption}</p>}
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <button onClick={() => setPreview(null)} style={{ ...btnSecondary, background: '#ffffff20', color: '#fff', border: '1px solid #ffffff40' }}>✕ Close</button>
                        </div>
                    </div>
                </div>
            )}

            <SectionBox>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading portfolio...</div>
                ) : items.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
                        <p style={{ fontSize: 15, margin: 0 }}>No portfolio images yet.</p>
                        <p style={{ fontSize: 13, margin: '4px 0 0' }}>Add photos from past events to showcase your work.</p>
                    </div>
                ) : (
                    <div style={galleryGrid}>
                        {items.map(item => (
                            <div key={item._id} style={cardStyle}>
                                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px 8px 0 0', height: 180 }}
                                    onClick={() => setPreview(item)}>
                                    <img src={item.url} alt={item.caption || 'Portfolio'} style={imgStyle}
                                        onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }} />
                                    <div style={imgOverlay}>
                                        <span style={{ color: '#fff', fontSize: 22 }}>🔍</span>
                                    </div>
                                </div>
                                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.caption || 'No caption'}
                                    </span>
                                    <button onClick={() => handleDelete(item._id)} style={deleteBtnStyle} title="Remove">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>
        </div>
    );
}

const galleryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, padding: 4 };
const cardStyle = { background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', display: 'block' };
const imgOverlay = { position: 'absolute', inset: 0, background: '#00000050', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'zoom-in' };
const deleteBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px', marginLeft: 8, opacity: 0.7 };
const modalOverlay = { position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };
const modalBox = { background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.3)' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none' };
const btnSecondary = { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 14, color: '#475569' };
