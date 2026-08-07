import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

const EMPTY = { name: '', category: '', description: '', price: '', priceUnit: 'per event', status: 'active', imageFile: null, imagePreview: '' };
const CATEGORIES = ['Photography', 'Catering', 'DJ & Sound', 'Decoration', 'Stage Setup', 'Transport', 'Security', 'Other'];

export default function MyServices() {
    const { user } = useAuth();
    const email = user?.email || '';
    const vendorId = user?.id || user?._id || '';
    console.log('CURRENT USER:', user);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);   // null | 'add' | 'edit'
    const [form, setForm] = useState(EMPTY);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { if (email) load(); }, [email]);

    async function load() {
        setLoading(true);
        try { const d = await vendorApi.getServices(email); setServices(d.services || []); }
        catch { setServices([]); }
        finally { setLoading(false); }
    }

    function openAdd() { setForm(EMPTY); setEditing(null); setModal('add'); setMsg(''); }
    function openEdit(s) { setForm({ name: s.name, category: s.category, description: s.description, price: s.price, priceUnit: s.priceUnit, status: s.status, imageFile: null, imagePreview: s.image ? `http://localhost:5000${s.image}` : '' }); setEditing(s._id); setModal('edit'); setMsg(''); }

    async function handleSave() {
        if (!form.name || !form.category || !form.price) { setMsg('Name, category and price are required.'); return; }
        setSaving(true);
        try {
            if (modal === 'add') {
                // Use FormData to support image upload
                const fd = new FormData();
                fd.append('vendorEmail', email);
                fd.append('vendorId', vendorId);
                fd.append('name', form.name);
                fd.append('category', form.category);
                fd.append('description', form.description || '');
                fd.append('price', Number(form.price));
                fd.append('priceUnit', form.priceUnit || 'per event');
                fd.append('status', form.status || 'active');
                if (form.imageFile) fd.append('image', form.imageFile);
                await vendorApi.createServiceWithImage(fd);
            } else {
                await vendorApi.updateService(editing, { ...form, price: Number(form.price) });
            }
            setModal(null); load();
        } catch (e) { setMsg(e.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this service?')) return;
        await vendorApi.deleteService(id);
        load();
    }

    return (
        <div>
            <PageHeader title="My Services" subtitle="Manage your service listings — connected to MongoDB"
                action={<button className="btn-primary" onClick={openAdd}>+ Add Service</button>} />

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading from MongoDB...</div>
            ) : services.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    No services yet. <button onClick={openAdd} style={{ color: '#ec4899', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add your first service →</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {services.map(s => (
                        <SectionBox key={s._id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.category}</div>
                                </div>
                                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: s.status === 'active' ? '#dcfce7' : '#fef3c7', color: s.status === 'active' ? '#16a34a' : '#d97706' }}>
                                    {s.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                {[['📦', s.bookings ?? 0, 'Bookings'], [`ETB ${(s.revenue || 0).toLocaleString()}`, null, 'Revenue'], [s.rating ?? 'N/A', null, 'Rating']].map(([v, , l], i) => (
                                    <div key={i} style={{ flex: 1, background: '#f8fafc', padding: '8px 6px', borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                                ETB {Number(s.price).toLocaleString()} {s.priceUnit}
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                                <button className="btn-sm" onClick={() => handleDelete(s._id)} style={{ color: '#ef4444' }}>🗑️ Delete</button>
                            </div>
                        </SectionBox>
                    ))}
                </div>
            )}

            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setModal(null)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{modal === 'add' ? 'Add New Service' : 'Edit Service'}</h3>
                        {msg && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}>{msg}</div>}
                        {[
                            ['Service Name *', 'text', 'name', 'e.g. Wedding Photography'],
                            ['Price (ETB) *', 'number', 'price', '5000'],
                            ['Price Unit', 'text', 'priceUnit', 'per event'],
                            ['Description', 'text', 'description', 'Short description...'],
                        ].map(([label, type, key, ph]) => (
                            <div key={key} style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
                                <input type={type} value={form[key]} placeholder={ph}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                            </div>
                        ))}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Category *</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        {/* Image upload — only on Add */}
                        {modal === 'add' && (
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                    Service Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    style={{ fontSize: 13 }}
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setForm(f => ({
                                                ...f,
                                                imageFile: file,
                                                imagePreview: URL.createObjectURL(file),
                                            }));
                                        }
                                    }}
                                />
                                {form.imagePreview && (
                                    <img src={form.imagePreview} alt="preview"
                                        style={{ marginTop: 10, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    />
                                )}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn-sm" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Create Service' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
