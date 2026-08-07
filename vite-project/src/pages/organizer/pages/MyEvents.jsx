import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

const CATEGORIES = ['Concert', 'Conference', 'Exhibition', 'Workshop', 'Seminar', 'Festival', 'Networking', 'Webinar', 'Sports', 'Cultural', 'Food'];
const EMPTY = { title: '', description: '', venue: '', date: '', time: '', ticketPrice: '', capacity: '', category: '', banner: '' };

export default function MyEvents() {
    const { user } = useAuth();
    const email = user?.email || '';
    const fileRef = useRef(null);

    const [myEvents, setMyEvents] = useState([]);
    const [loadingMy, setLoadingMy] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingEvent, setEditingEvent] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [editPreview, setEditPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (email) loadMy();
    }, [email]);

    async function loadMy() {
        setLoadingMy(true);
        try { const d = await organizerApi.getEvents(email); setMyEvents(d.events || []); }
        catch { setMyEvents([]); }
        finally { setLoadingMy(false); }
    }

    function reload() { loadMy(); }

    // Simple, reliable: always use myEvents as the source of truth for ownership.
    // Build a lookup map keyed by both _id string and id string.
    const myMap = new Map();
    myEvents.forEach(e => {
        const key = String(e._id);
        myMap.set(key, e);
    });

    function isMine(ev) {
        const key = String(ev._id || ev.id || '');
        return key.length >= 10 && myMap.has(key); // >= 10 filters out short static ids like 's1'
    }

    function getRawEvent(ev) {
        const key = String(ev._id || ev.id || '');
        return myMap.get(key) || ev;
    }

    let displayed;
    if (filter === 'mine') {
        displayed = myEvents;
    } else if (filter === 'published') {
        displayed = myEvents.filter(e => e.published);
    } else if (filter === 'draft') {
        displayed = myEvents.filter(e => !e.published);
    } else {
        // All Events: only organizer's own events (no static events)
        displayed = myEvents;
    }

    if (search) {
        const s = search.toLowerCase();
        displayed = displayed.filter(e =>
            (e.title || '').toLowerCase().includes(s) ||
            (e.venue || e.location || '').toLowerCase().includes(s)
        );
    }

    function openEdit(ev) {
        const raw = getRawEvent(ev);
        setEditingEvent(raw);
        setEditPreview(raw.banner || raw.img || '');
        setForm({
            title: raw.title || '', description: raw.description || '',
            venue: raw.venue || raw.location || '', date: raw.date || '',
            time: raw.time || '', ticketPrice: raw.ticketPrice ?? '',
            capacity: raw.capacity ?? '', category: raw.category || '',
            banner: raw.banner || raw.img || '',
        });
        if (fileRef.current) fileRef.current.value = '';
    }

    function handleEditFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditPreview(URL.createObjectURL(file));
        uploadBanner(file);
    }

    async function uploadBanner(file) {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('banner', file);
            const res = await fetch('http://localhost:5000/api/upload/banner', { method: 'POST', body: fd });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { throw new Error(`Server error (${res.status})`); }
            if (!data.success) throw new Error(data.message);
            setForm(f => ({ ...f, banner: data.url }));
            setEditPreview(data.url);
        } catch (err) { alert('Upload failed: ' + err.message); }
        finally { setUploading(false); }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await organizerApi.updateEvent(editingEvent._id, {
                ...form, ticketPrice: Number(form.ticketPrice), capacity: Number(form.capacity),
            });
            setEditingEvent(null);
            reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(ev) {
        const raw = getRawEvent(ev);
        if (!raw._id || !window.confirm('Delete this event?')) return;
        await organizerApi.deleteEvent(raw._id);
        reload();
    }

    async function handleTogglePublish(ev) {
        const raw = getRawEvent(ev);
        if (!raw._id) return;
        await organizerApi.togglePublish(raw._id);
        reload();
    }

    const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' };
    const loading = loadingMy;

    return (
        <div>
            <PageHeader title="My Events" subtitle={`${displayed.length} events`} />

            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
                    style={{ flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
                {[{ key: 'all', label: 'All Events' }, { key: 'mine', label: 'My Events' }, { key: 'published', label: 'Published' }, { key: 'draft', label: 'Draft' }].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: '7px 14px', borderRadius: 20, border: '1px solid',
                        borderColor: filter === f.key ? '#0ea5e9' : '#e2e8f0',
                        background: filter === f.key ? '#0ea5e9' : '#fff',
                        color: filter === f.key ? '#fff' : '#64748b',
                        fontWeight: 600, fontSize: 12, cursor: 'pointer',
                    }}>{f.label}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading events...</div>
            ) : displayed.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🎪</div>
                    <p style={{ margin: 0 }}>No events found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                    {displayed.map(ev => {
                        const mine = isMine(ev);
                        const raw = mine ? getRawEvent(ev) : null;
                        const published = raw ? raw.published : false;
                        const img = ev.banner || ev.img || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
                        const price = ev.price || (Number(ev.ticketPrice) === 0 ? 'Free' : ev.ticketPrice ? `ETB ${Number(ev.ticketPrice).toLocaleString()}` : '');
                        const venue = ev.location || ev.venue || '';
                        const badgeColor = ev.badgeColor || '#6366f1';
                        const badge = ev.badge || ev.category || 'Event';

                        return (
                            <div key={String(ev._id || ev.id)} style={{
                                background: '#fff', borderRadius: 12, overflow: 'hidden',
                                border: `1px solid ${mine ? '#0ea5e930' : '#e5e7eb'}`,
                                boxShadow: mine ? '0 0 0 2px #0ea5e920' : '0 1px 4px rgba(0,0,0,.06)',
                                position: 'relative', display: 'flex', flexDirection: 'column',
                            }}>
                                {mine && (
                                    <div style={{
                                        position: 'absolute', top: 10, right: 10, zIndex: 3,
                                        background: published ? '#10b981' : '#f59e0b',
                                        color: '#fff', fontSize: 10, fontWeight: 700,
                                        padding: '3px 8px', borderRadius: 20,
                                    }}>
                                        {published ? '✓ Published' : 'Draft'}
                                    </div>
                                )}

                                <div style={{ height: 180, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                    <img src={img} alt={ev.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'; }}
                                    />
                                    <span style={{
                                        position: 'absolute', top: 12, left: 12,
                                        background: badgeColor, color: '#fff', fontSize: 12,
                                        fontWeight: 600, padding: '4px 14px', borderRadius: 50,
                                    }}>{badge}</span>
                                </div>

                                <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{ev.title}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                        <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', gap: 6 }}><span>📍</span><span>{venue}</span></div>
                                        <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', gap: 6 }}><span>📅</span><span>{ev.date}</span></div>
                                    </div>

                                    <div style={{ paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>{price}</span>
                                            {!mine && <span style={{ color: '#6366f1', fontWeight: 700 }}>→</span>}
                                        </div>

                                        {mine && (
                                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                                <button onClick={() => openEdit(ev)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleTogglePublish(ev)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: published ? '#fef3c7' : '#dcfce7', color: published ? '#92400e' : '#166534', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                    {published ? '⊘ Unpublish' : '✓ Publish'}
                                                </button>
                                                <button onClick={() => handleDelete(ev)} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#b91c1c', fontSize: 13, cursor: 'pointer' }}>
                                                    🗑
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            {editingEvent && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                    onClick={() => setEditingEvent(null)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Event</h3>
                            <button onClick={() => setEditingEvent(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *" required style={inp} />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} style={{ ...inp, resize: 'vertical' }} />
                            <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue *" required style={inp} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
                                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inp} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input type="number" value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: e.target.value })} placeholder="Price (0=Free)" style={inp} />
                                <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" style={inp} />
                            </div>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: '0 0 6px', textTransform: 'uppercase' }}>Banner Image</p>
                                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleEditFileChange} disabled={uploading} />
                                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f1f5f9', border: '1.5px dashed #cbd5e1', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, color: '#475569', fontWeight: 600 }}>
                                    🖼️ {uploading ? 'Uploading...' : editPreview ? 'Change Image' : 'Choose Image'}
                                </button>
                                {editPreview && (
                                    <img src={editPreview} alt="preview" style={{ marginTop: 8, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0', display: 'block' }} />
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                <button type="button" onClick={() => setEditingEvent(null)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                                <button type="submit" disabled={saving || uploading} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
