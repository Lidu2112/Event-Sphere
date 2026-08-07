import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

const CATEGORIES = ['Concert', 'Conference', 'Exhibition', 'Workshop', 'Seminar', 'Festival', 'Networking', 'Webinar', 'Sports', 'Cultural', 'Food'];
const EMPTY = { title: '', description: '', venue: '', date: '', time: '', ticketPrice: '', capacity: '', category: '', banner: '' };

export default function CreateEvent() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(''); // local blob preview — instant
    const fileRef = useRef(null);

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show instant local preview regardless of upload
        const local = URL.createObjectURL(file);
        setPreviewUrl(local);
        uploadBanner(file);
    }

    async function uploadBanner(file) {
        setUploading(true);
        setMsg(null);
        try {
            const fd = new FormData();
            fd.append('banner', file);
            const res = await fetch('http://localhost:5000/api/upload/banner', {
                method: 'POST',
                body: fd,
            });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); }
            catch { throw new Error(`Server not reachable (status ${res.status}). Is the backend running on port 5000?`); }
            if (!data.success) throw new Error(data.message);
            // Replace blob URL with permanent server URL
            setForm(f => ({ ...f, banner: data.url }));
            setPreviewUrl(data.url);
        } catch (err) {
            setMsg({ ok: false, text: `Image upload failed: ${err.message}` });
            // Keep local blob preview so user still sees the image
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title || !form.date || !form.venue) {
            setMsg({ ok: false, text: 'Title, date and venue are required.' });
            return;
        }
        setSaving(true);
        try {
            console.log("Submitting Event:", {
    ...form,
    organizerEmail: user?.email,
    organizerId: user?.id || user?._id,
});
            await organizerApi.createEvent({
                ...form,
                ticketPrice: Number(form.ticketPrice) || 0,
                capacity: Number(form.capacity) || 100,
                organizerEmail: user?.email,
                organizerId: user?.id || user?._id,
            });
            // Redirect to My Events so user can see and publish the new event
            navigate('/organizer/events');
        } catch (err) {
            setMsg({ ok: false, text: err.message });
            setSaving(false);
        }
    }

    const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' };
    const lbl = { fontSize: '11px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' };

    return (
        <div>
            <PageHeader title="Create Event" subtitle="Fill in the details and publish from My Events" />

            {msg && (
                <div style={{ padding: '11px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626' }}>
                    {msg.text}
                </div>
            )}

            <SectionBox title="Event Details">
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>

                    <div><label style={lbl}>Title *</label>
                        <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Addis Music Festival 2026" style={inp} />
                    </div>

                    <div><label style={lbl}>Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your event..." style={{ ...inp, resize: 'vertical' }} />
                    </div>

                    <div><label style={lbl}>Venue *</label>
                        <input required value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Meskel Square, Addis Ababa" style={inp} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={lbl}>Date *</label>
                            <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
                        </div>
                        <div><label style={lbl}>Time</label>
                            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inp} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={lbl}>Ticket Price (ETB)</label>
                            <input type="number" min="0" value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: e.target.value })} placeholder="0 = Free" style={inp} />
                        </div>
                        <div><label style={lbl}>Capacity</label>
                            <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="100" style={inp} />
                        </div>
                    </div>

                    <div>
                        <label style={lbl}>Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Banner image */}
                    <div>
                        <label style={lbl}>Event Banner / Cover Image</label>

                        {/* Hidden real file input */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            disabled={uploading}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '9px 18px', background: '#f1f5f9',
                                    border: '1.5px dashed #cbd5e1', borderRadius: 8,
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    fontSize: 13, color: '#475569', fontWeight: 600,
                                }}
                            >
                                🖼️ {uploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Choose Image'}
                            </button>
                            {previewUrl && (
                                <button type="button" onClick={() => { setPreviewUrl(''); setForm(f => ({ ...f, banner: '' })); if (fileRef.current) fileRef.current.value = ''; }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }} title="Remove">
                                    ✕
                                </button>
                            )}
                        </div>

                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '5px 0 0' }}>JPG, PNG, WebP or GIF — max 5 MB</p>

                        {previewUrl && (
                            <div style={{ marginTop: 10, position: 'relative', width: '100%' }}>
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0', display: 'block' }} />
                                <span style={{ position: 'absolute', bottom: 8, left: 10, background: '#00000070', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
                                    {uploading ? '⏳ Uploading...' : '✓ Preview'}
                                </span>
                            </div>
                        )}
                    </div>

                    <button className="btn-primary" type="submit" disabled={saving || uploading} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                        {saving ? 'Creating...' : '✅ Create Event'}
                    </button>
                </form>
            </SectionBox>
        </div>
    );
}
