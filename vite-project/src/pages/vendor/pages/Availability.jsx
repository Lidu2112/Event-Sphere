import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Availability() {
    const { user } = useAuth();
    const email = user?.email || '';
    const vendorId = user?.id || user?._id || '';

    const [availableDays, setAvailableDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!email) return;
        vendorApi.getAvailability(email)
            .then(d => {
                if (d.availability?.availableDays?.length) {
                    setAvailableDays(d.availability.availableDays);
                }
                setUpcomingBookings(d.upcomingBookings || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [email]);

    function toggleDay(day) {
        setAvailableDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
        setSaved(false);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await vendorApi.saveAvailability({
                vendorEmail: email,
                vendorId,
                availableDays,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Failed to save: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    // Days that have accepted bookings
    const bookedDayNames = upcomingBookings
        .map(b => {
            if (!b.eventDate) return null;
            const d = new Date(b.eventDate);
            return isNaN(d) ? null : d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
        })
        .filter(Boolean);

    if (loading) return (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading availability from MongoDB...</div>
    );

    return (
        <div>
            <PageHeader
                title="Manage Availability"
                subtitle="Set your weekly schedule — saved to MongoDB"
                action={
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                        style={{ background: saved ? '#10b981' : undefined }}
                    >
                        {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Availability'}
                    </button>
                }
            />

            {/* Weekly day toggles */}
            <SectionBox title="Weekly Availability — click to toggle">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                    {ALL_DAYS.map(day => {
                        const isAvailable = availableDays.includes(day);
                        const isBooked = bookedDayNames.includes(day);
                        const bg = isBooked ? '#fef3c7' : isAvailable ? '#dcfce7' : '#f1f5f9';
                        const color = isBooked ? '#d97706' : isAvailable ? '#16a34a' : '#94a3b8';
                        const label = isBooked ? 'Booked' : isAvailable ? 'Available' : 'Unavailable';

                        return (
                            <div
                                key={day}
                                onClick={() => !isBooked && toggleDay(day)}
                                style={{
                                    padding: '14px 8px',
                                    borderRadius: 10,
                                    textAlign: 'center',
                                    background: bg,
                                    color,
                                    cursor: isBooked ? 'not-allowed' : 'pointer',
                                    border: `2px solid ${isAvailable ? color + '60' : 'transparent'}`,
                                    transition: 'all 0.2s',
                                    userSelect: 'none',
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{day}</div>
                                <div style={{ fontSize: 10, marginTop: 4, fontWeight: 500 }}>{label}</div>
                            </div>
                        );
                    })}
                </div>
                <p style={{ marginTop: 14, fontSize: 11, color: '#94a3b8' }}>
                    Click a day to mark it available or unavailable. Days with accepted bookings cannot be changed.
                </p>
            </SectionBox>

            {/* Upcoming accepted bookings from MongoDB */}
            <SectionBox title={`Upcoming Bookings (${upcomingBookings.length})`}>
                {upcomingBookings.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No upcoming accepted bookings
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {upcomingBookings.map((b, i) => (
                            <div key={b._id || i} style={{
                                padding: '12px 14px',
                                background: '#f8fafc',
                                borderRadius: 10,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: '3px solid #10b981',
                            }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{b.eventName}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                                        {b.serviceName} · {b.clientName}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{b.eventDate}</div>
                                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>✓ Accepted</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionBox>
        </div>
    );
}
