import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { organizerApi } from '../../../api/organizer';

export default function ManageVendors() {
    const { user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [booked, setBooked] = useState([]);
    const [msg, setMsg] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [chatText, setChatText] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [form, setForm] = useState({
        eventName: '',
        eventDate: '',
        eventTime: '',
        location: '',
        budget: '',
        notes: ''
    });

    useEffect(() => { if (user?.email) load(); }, [user]);

    useEffect(() => {
        if (!user?.email) return;
        const params = new URLSearchParams(window.location.search);
        const payment = params.get('payment');
        const bookingId = params.get('bookingId');
        if (!payment) return;

        if (payment === 'success') {
            setMsg({ ok: true, text: 'Payment verified successfully. Your booking is now paid.' });
        } else if (payment === 'failed') {
            setMsg({ ok: false, text: 'Payment verification failed. Please try again.' });
        } else if (payment === 'pending') {
            setMsg({ ok: false, text: 'Payment is pending verification. Refresh this page if it does not update.' });
        }

        load();
        params.delete('payment');
        params.delete('bookingId');
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [user]);

    async function load(s = '') {
        setLoading(true);
        try {
            const [vendorsRes, bookingsRes] = await Promise.all([
                organizerApi.getVendors(user.email, s),
                organizerApi.getVendorBookings(user.email)
            ]);
            setVendors(vendorsRes.vendors || []);
            setBooked((bookingsRes.bookings || []).map(b => ({
                ...b,
                vendorName: b.vendorName || b.vendorEmail || 'Vendor',
                email: b.vendorEmail || b.clientEmail || '',
                bookedAt: b.createdAt || b.bookedAt || new Date().toISOString(),
            })));
        } catch { setVendors([]); setBooked([]); }
        finally { setLoading(false); }
    }

    function handleSearch(v) { setSearch(v); load(v); }

    async function handleBook(vendor) {
        if (!user?.email) {
            setMsg({ ok: false, text: 'Please sign in again to send the booking request.' });
            return;
        }

        if (!form.eventName.trim() || !form.eventDate || !form.eventTime || !form.location.trim()) {
            setMsg({ ok: false, text: 'Please fill the event name, date, time, and location.' });
            return;
        }

        try {
            const d = await organizerApi.createVendorBooking({
                organizerEmail: user.email,
                organizerId: user.id || user._id || '',
                organizerName: user.name || user.email,
                vendorEmail: vendor.email,
                vendorId: vendor._id,
                vendorName: vendor.name,
                serviceName: vendor.service || 'Service Request',
                eventName: form.eventName.trim(),
                eventDate: form.eventDate,
                eventTime: form.eventTime,
                location: form.location.trim(),
                amount: Number(form.budget) || 0,
                notes: form.notes.trim() || `Booking request from ${user.name || user.email}`,
            });

            const created = d.booking || {};
            setBooked(prev => [{
                _id: created._id || `${vendor._id}-${Date.now()}`,
                vendorId: vendor._id,
                vendorName: vendor.name,
                email: vendor.email,
                vendorEmail: vendor.email,
                status: created.status || 'pending',
                bookedAt: created.createdAt || new Date().toISOString(),
                messages: created.messages || [],
            }, ...prev]);
            setSelected(null);
            setForm({ eventName: '', eventDate: '', eventTime: '', location: '', budget: '', notes: '' });
            setMsg({ ok: true, text: `${vendor.name} booking request sent!` });
            setTimeout(() => setMsg(null), 3000);
        } catch (e) {
            setMsg({ ok: false, text: e.message || 'Unable to send booking request.' });
            setTimeout(() => setMsg(null), 3000);
        }
    }

    async function payBooking(booking) {
        try {
            const d = await organizerApi.payVendorBooking(booking._id);
            const updatedBooking = d.booking || booking;
            setBooked(prev => prev.map(item => item._id === booking._id ? { ...item, ...updatedBooking, paymentStatus: updatedBooking.paymentStatus || 'pending' } : item));
            if (selectedBooking?._id === booking._id) setSelectedBooking({ ...selectedBooking, ...updatedBooking, paymentStatus: updatedBooking.paymentStatus || 'pending' });
            if (d.checkout_url) {
                window.location.assign(d.checkout_url);
                setMsg({ ok: true, text: 'Redirecting to Chapa for payment.' });
            } else {
                setMsg({ ok: true, text: d.message || 'Payment request updated.' });
            }
        } catch (e) {
            setMsg({ ok: false, text: e.message || 'Unable to update payment.' });
        }
    }

    async function completeBooking(booking) {
        try {
            const d = await organizerApi.completeVendorBooking(booking._id);
            setBooked(prev => prev.map(item => item._id === booking._id ? { ...item, ...d.booking } : item));
            if (selectedBooking?._id === booking._id) setSelectedBooking({ ...selectedBooking, ...d.booking });
            setMsg({ ok: true, text: 'Booking marked completed.' });
        } catch (e) {
            setMsg({ ok: false, text: e.message || 'Unable to complete booking.' });
        }
    }

    async function sendChatMessage(booking) {
        if (!chatText.trim()) return;
        setChatLoading(true);
        try {
            const d = await organizerApi.sendVendorBookingMessage(booking._id, { message: chatText.trim(), sender: 'organizer' });
            const updatedBooking = d.booking || booking;
            setBooked(prev => prev.map(item => item._id === booking._id ? { ...item, ...updatedBooking, messages: updatedBooking.messages || item.messages } : item));
            if (selectedBooking?._id === booking._id) setSelectedBooking({ ...selectedBooking, ...updatedBooking, messages: updatedBooking.messages || selectedBooking.messages });
            setChatText('');
        } catch (e) {
            setMsg({ ok: false, text: e.message || 'Unable to send message.' });
        } finally {
            setChatLoading(false);
        }
    }

    return (
        <div>
            <PageHeader title="Manage Vendors" subtitle="Browse registered vendors and request bookings" />
            {msg && (
                <div style={{ padding: '11px 16px', borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 600, background: msg.ok ? '#dcfce7' : '#fee2e2', color: msg.ok ? '#16a34a' : '#dc2626' }}>
                    {msg.text}
                </div>
            )}
            <div style={{ marginBottom: 16 }}>
                <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search vendors by name..." style={{ width: '100%', maxWidth: 360, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }} />
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading vendors...</div>
            ) : vendors.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No vendors registered yet.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {vendors.map(v => (
                        <div key={v._id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                                <span className={`status-badge ${v.status === 'active' ? 'active' : 'pending'}`}>{v.status}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{v.email}</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-sm" onClick={() => setSelected(v)}>View</button>
                                <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleBook(v)}>Book</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {booked.length > 0 && (
                <SectionBox title="My Booking Requests">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>{['Vendor', 'Email', 'Status', 'Booked At', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {booked.map((b, i) => (
                                <tr key={b._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', fontWeight: 600, fontSize: 12 }}>{b.vendorName}</td>
                                    <td style={{ padding: '12px 10px', fontSize: 11, color: '#94a3b8' }}>{b.email}</td>
                                    <td style={{ padding: '12px 10px' }}><span className="status-badge pending">{b.status}</span></td>
                                    <td style={{ padding: '12px 10px', fontSize: 11, color: '#94a3b8' }}>{new Date(b.bookedAt).toLocaleString()}</td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn-sm" onClick={() => setSelectedBooking(b)}>Chat</button>
                                            {b.status === 'accepted' && b.paymentStatus !== 'paid' && (
                                                <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => payBooking(b)}>Pay</button>
                                            )}
                                            {(b.paymentStatus === 'paid' || b.status === 'completed') && (
                                                <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => completeBooking(b)}>Complete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionBox>
            )}

            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <h3 style={{ marginBottom: 12 }}>Conversation with {selectedBooking.vendorName}</h3>
                        <div style={{ maxHeight: 220, overflowY: 'auto', background: '#f8fafc', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                            {(selectedBooking.messages || []).length === 0 ? (
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>No messages yet.</div>
                            ) : (selectedBooking.messages || []).map((m, i) => (
                                <div key={i} style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 8, background: m.sender === 'organizer' ? '#dcfce7' : '#fff', fontSize: 12 }}>
                                    <div style={{ fontWeight: 700, marginBottom: 2, color: '#334155' }}>{m.sender === 'organizer' ? 'You' : m.sender === 'vendor' ? 'Vendor' : 'System'}</div>
                                    <div>{m.text}</div>
                                </div>
                            ))}
                        </div>
                        <textarea value={chatText} onChange={e => setChatText(e.target.value)} rows={3} placeholder="Write a message to the vendor..." style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, fontSize: 12, resize: 'vertical' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                            <button className="btn-secondary" onClick={() => setSelectedBooking(null)}>Close</button>
                            <button className="btn-primary" onClick={() => sendChatMessage(selectedBooking)} disabled={chatLoading}>{chatLoading ? 'Sending...' : 'Send'}</button>
                        </div>
                    </div>
                </div>
            )}

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <h3 style={{ marginBottom: 12 }}>{selected.name}</h3>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <div><strong>Email:</strong> {selected.email}</div>
                            <div><strong>Phone:</strong> {selected.phone || '—'}</div>
                            <div><strong>Status:</strong> {selected.status}</div>
                        </div>
                        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                            <input value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })} placeholder="Event Name" style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                                <input type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                            </div>
                            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                            <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="Budget (ETB)" style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Notes (example: Need full-day photography)" style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            <button className="btn-primary" onClick={() => handleBook(selected)}>Send Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
